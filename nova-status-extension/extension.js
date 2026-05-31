const { GLib, St, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

let _indicator = null;
let _timeout = null;

let _prevRx = 0;
let _prevTx = 0;
let _prevDiskR = 0;
let _prevDiskW = 0;
let _prevTime = 0;

function init() {
}

function _read(path) {
    try {
        let [ok, contents] = GLib.file_get_contents(path);
        if (!ok) return null;
        return imports.byteArray.toString(contents).trim();
    } catch (e) {
        return null;
    }
}

function _fmtSpeed(bps) {
    if (bps == null || bps < 0) return '--';
    if (bps < 1024) return bps.toFixed(0) + 'B';
    if (bps < 1048576) return (bps / 1024).toFixed(0) + 'K';
    return (bps / 1048576).toFixed(1) + 'M';
}

function _update() {
    try {
        let now = GLib.get_monotonic_time() / 1000000;
        let dt = _prevTime > 0 ? now - _prevTime : 0;

        let tempRaw = _read('/sys/class/thermal/thermal_zone0/temp');
        let temp = tempRaw ? Math.round(parseInt(tempRaw) / 1000) : '??';

        let b0 = parseInt(_read('/sys/devices/system/cpu/cpufreq/policy4/scaling_cur_freq') || '0') / 1e6;
        let b1 = parseInt(_read('/sys/devices/system/cpu/cpufreq/policy6/scaling_cur_freq') || '0') / 1e6;
        let big = ((b0 + b1) / 2).toFixed(1);
        let little = (parseInt(_read('/sys/devices/system/cpu/cpufreq/policy0/scaling_cur_freq') || '0') / 1e6).toFixed(1);

        let meminfo = _read('/proc/meminfo') || '';
        let memMatch = meminfo.match(/MemAvailable:\s+(\d+)/);
        let memGB = memMatch ? (parseInt(memMatch[1]) / 1048576).toFixed(1) : '??';

        let rxBytes = 0, txBytes = 0;
        let netRaw = _read('/proc/net/dev') || '';
        let netLines = netRaw.split('\n');
        for (let i = 0; i < netLines.length; i++) {
            let line = netLines[i].trim();
            if (!line) continue;
            let colon = line.indexOf(':');
            if (colon === -1) continue;
            let iface = line.substring(0, colon).trim();
            if (iface === 'lo' || iface.startsWith('vir') || iface.startsWith('docker') || iface.startsWith('br-'))
                continue;
            let parts = line.substring(colon + 1).trim().split(/\s+/);
            rxBytes += parseInt(parts[0]) || 0;
            txBytes += parseInt(parts[8]) || 0;
        }

        let netDown = '--', netUp = '--';
        if (dt > 0 && _prevTime > 0) {
            netDown = _fmtSpeed((rxBytes - _prevRx) / dt);
            netUp = _fmtSpeed((txBytes - _prevTx) / dt);
        }
        _prevRx = rxBytes;
        _prevTx = txBytes;

        let diskR = '--', diskW = '--';
        let diskRaw = _read('/sys/block/mmcblk1/stat');
        if (diskRaw) {
            let parts = diskRaw.trim().split(/\s+/);
            let r = parseInt(parts[2]) || 0;
            let w = parseInt(parts[6]) || 0;
            if (dt > 0 && _prevTime > 0) {
                diskR = _fmtSpeed((r - _prevDiskR) * 512 / dt);
                diskW = _fmtSpeed((w - _prevDiskW) * 512 / dt);
            }
            _prevDiskR = r;
            _prevDiskW = w;
        }

        _prevTime = now;

        _label.text = '\u{1F525}' + temp + '\u00B0C \u{1F39B}\uFE0F' + big + '/' + little + 'G \u2193' + netDown + ' \u2191' + netUp + ' R' + diskR + ' W' + diskW + ' \u{1F4CA}' + memGB + 'G';
    } catch (e) {
        logError(e, 'NovaStatus');
    }
}

function enable() {
    _indicator = new PanelMenu.Button(0.0, 'Nova Status', false);

    _label = new St.Label({
        text: '\u{1F525}...\u00B0C',
        y_align: Clutter.ActorAlign.CENTER,
        y_expand: true,
        style_class: 'nova-status-label',
    });
    _indicator.add_child(_label);

    Main.panel.addToStatusArea('nova-status', _indicator, 0, 'right');

    _update();
    _timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, function () {
        _update();
        return GLib.SOURCE_CONTINUE;
    });
}

function disable() {
    if (_timeout) {
        GLib.source_remove(_timeout);
        _timeout = 0;
    }
    if (_indicator) {
        _indicator.destroy();
        _indicator = null;
    }
    _label = null;
}
