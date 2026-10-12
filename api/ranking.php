<?php
/**
 * Ranking do Pac-Man (modo clássico e modo inverso).
 *
 * GET  ?mode=inverse → { ok, top }                           10 melhores
 * POST               → { ok, top, position, entry, improved } grava a pontuação
 *        corpo JSON: { name, score, level, time, mode, ghost }
 *        (mode: 'classic' ou 'inverse'; ghost só no modo inverso)
 *
 * Os dados ficam em data/ranking.json e data/ranking-inverse.json (bloqueados
 * para acesso direto pelo data/.htaccess). Cada nome aparece uma vez por modo,
 * com a melhor pontuação.
 *
 * @author Sandro Jordão.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

date_default_timezone_set('America/Sao_Paulo');

define('DATA_DIR', dirname(__DIR__) . '/data');
define('TOP', 10);
define('MAX_ENTRIES', 100);
define('MIN_INTERVAL', 10); // segundos entre envios do mesmo IP

// Precisa bater com as regras do main.js: por fase, 154 pastilhas (10),
// 4 power pills (50) e até 4 fantasmas por power pill (200 + 400 + 800 + 1600).
define('MAX_SCORE_PER_LEVEL', 154 * 10 + 4 * 50 + 4 * 3000);
define('MIN_SECONDS_PER_LEVEL', 25);

// Modo inverso (inverse.js): fase vencida = 3 capturas (1000) + bônus de até
// 158 pastilhas (10); na fase perdida, no máximo 2 capturas. Tudo vezes o
// multiplicador do fantasma. Vencer uma fase leva pelo menos uns 12s
// (capturas, mortes e READY!) e perder exige o Pacman comer as 158 pastilhas.
define('INVERSE_WON_LEVEL_MAX', 3 * 1000 + 158 * 10);
define('INVERSE_LOST_LEVEL_MAX', 2 * 1000);
define('INVERSE_MIN_SECONDS_PER_WON_LEVEL', 12);
define('INVERSE_MIN_SECONDS_LAST_LEVEL', 30);

$GHOST_MULTIPLIER = array('blinky' => 1, 'pinky' => 1, 'inky' => 1, 'clyde' => 5);

function respond($data, $code = 200)
{
	http_response_code($code);

	echo json_encode($data, JSON_UNESCAPED_UNICODE);

	exit;
}

function fail($error, $code)
{
	respond(array('ok' => false, 'error' => $error), $code);
}

function ranking_file($mode)
{
	return DATA_DIR . ($mode === 'inverse' ? '/ranking-inverse.json' : '/ranking.json');
}

function open_ranking($mode)
{
	if ( ! is_dir(DATA_DIR) && ! @mkdir(DATA_DIR, 0775, true))
	{
		fail('Não foi possível gravar o ranking.', 500);
	}

	$fp = @fopen(ranking_file($mode), 'c+');

	if ( ! $fp)
	{
		fail('Não foi possível gravar o ranking.', 500);
	}

	return $fp;
}

function read_ranking($fp)
{
	rewind($fp);

	$data = json_decode((string) stream_get_contents($fp), true);

	if ( ! is_array($data)) $data = array();

	return $data + array('entries' => array(), 'ips' => array());
}

function write_ranking($fp, $data)
{
	ftruncate($fp, 0);
	rewind($fp);
	fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
	fflush($fp);
}

function public_entry($entry)
{
	$public = array(
		'name' => $entry['name'],
		'score' => $entry['score'],
		'level' => $entry['level'],
		'time' => $entry['time'],
		'date' => $entry['date']
	);

	if (isset($entry['ghost'])) $public['ghost'] = $entry['ghost'];

	return $public;
}

function top_entries($entries)
{
	return array_map('public_entry', array_slice($entries, 0, TOP));
}

function int_param($input, $key, $min, $max)
{
	$value = isset($input[$key]) ? filter_var($input[$key], FILTER_VALIDATE_INT) : false;

	if ($value === false || $value < $min || $value > $max)
	{
		fail('Dados da partida inválidos.', 422);
	}

	return $value;
}

function mode_param($value)
{
	return $value === 'inverse' ? 'inverse' : 'classic';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET')
{
	$fp = open_ranking(mode_param(isset($_GET['mode']) ? $_GET['mode'] : ''));

	flock($fp, LOCK_SH);
	$data = read_ranking($fp);
	flock($fp, LOCK_UN);
	fclose($fp);

	respond(array('ok' => true, 'top' => top_entries($data['entries'])));
}

if ($method !== 'POST')
{
	fail('Método não permitido.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if ( ! is_array($input))
{
	fail('Requisição inválida.', 400);
}

// Nome: letras (com acento), números, espaço, ponto, hífen e underline.
$name = isset($input['name']) ? trim(preg_replace('/\s+/u', ' ', (string) $input['name'])) : '';

if ( ! preg_match('/^[\p{L}\p{N} ._\-]{2,16}$/u', $name))
{
	fail('Use de 2 a 16 letras ou números no nome.', 422);
}

$mode = mode_param(isset($input['mode']) ? $input['mode'] : '');
$score = int_param($input, 'score', 10, 100000000);
$level = int_param($input, 'level', 1, 100000);
$time = int_param($input, 'time', 1, 864000);
$ghost = null;

// Confere se a partida é possível: toda pontuação é múltipla de 10, cada fase
// tem um máximo de pontos e um tempo mínimo.
if ($mode === 'inverse')
{
	$ghost = isset($input['ghost']) ? (string) $input['ghost'] : '';

	if ( ! isset($GHOST_MULTIPLIER[$ghost]))
	{
		fail('Dados da partida inválidos.', 422);
	}

	$max = (($level - 1) * INVERSE_WON_LEVEL_MAX + INVERSE_LOST_LEVEL_MAX) * $GHOST_MULTIPLIER[$ghost];
	$min_time = ($level - 1) * INVERSE_MIN_SECONDS_PER_WON_LEVEL + INVERSE_MIN_SECONDS_LAST_LEVEL;
}
else
{
	$max = $level * MAX_SCORE_PER_LEVEL;
	$min_time = ($level - 1) * MIN_SECONDS_PER_LEVEL;
}

if ($score % 10 !== 0 || $score > $max || $time < $min_time)
{
	fail('Dados da partida inválidos.', 422);
}

$fp = open_ranking($mode);

flock($fp, LOCK_EX);

$data = read_ranking($fp);
$now = time();

// Limita envios repetidos do mesmo IP (guardado só como hash).
$ip = hash('sha256', isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '');

foreach ($data['ips'] as $hash => $last)
{
	if ($now - $last > 3600) unset($data['ips'][$hash]);
}

if (isset($data['ips'][$ip]) && $now - $data['ips'][$ip] < MIN_INTERVAL)
{
	flock($fp, LOCK_UN);
	fclose($fp);

	fail('Calma! Espere alguns segundos e tente de novo.', 429);
}

$data['ips'][$ip] = $now;

// Cada nome aparece uma vez: só substitui se a pontuação nova for maior.
$key = mb_strtolower($name, 'UTF-8');
$index = null;

foreach ($data['entries'] as $i => $entry)
{
	if (mb_strtolower($entry['name'], 'UTF-8') === $key) { $index = $i; break; }
}

$entry = array(
	'name' => $name,
	'score' => $score,
	'level' => $level,
	'time' => $time,
	'date' => date('c', $now)
);

if ($ghost !== null) $entry['ghost'] = $ghost;

$improved = $index === null || $score > $data['entries'][$index]['score'];

if ($index === null)
{
	$data['entries'][] = $entry;
}
else if ($improved)
{
	$data['entries'][$index] = $entry;
}

// Maior pontuação primeiro; no empate, quem chegou antes.
usort($data['entries'], function ($a, $b) {
	return $b['score'] - $a['score'] ?: strcmp($a['date'], $b['date']);
});

$data['entries'] = array_slice($data['entries'], 0, MAX_ENTRIES);

$position = null;

foreach ($data['entries'] as $i => $saved)
{
	if (mb_strtolower($saved['name'], 'UTF-8') === $key)
	{
		$position = $i + 1;
		$entry = $saved;
		break;
	}
}

write_ranking($fp, $data);

flock($fp, LOCK_UN);
fclose($fp);

respond(array(
	'ok' => true,
	'top' => top_entries($data['entries']),
	'position' => $position,
	'entry' => $position ? public_entry($entry) : null,
	'improved' => $improved
));
