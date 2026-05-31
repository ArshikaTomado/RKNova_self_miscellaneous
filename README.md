# RKNova_self_miscellaneous

Random experiments & tools for my **Indiedroid Nova** (RK3588S, Armbian).

---

## Tools

### nova-status-extension

A minimal GNOME Shell extension for real-time system monitoring on the top bar — designed for RK3588's big.LITTLE architecture.

```
:fire: 52C :control_knobs: 2.4/1.8G :arrow_down: 12K :arrow_up: 3K R0B W1.2M :bar_chart: 9.3G
```

| Icon | Meaning | Source |
|------|---------|--------|
| :fire: | Package temperature | `/sys/class/thermal/thermal_zone0/temp` |
| :control_knobs: | Big/LITTLE core freq avg (GHz) | `/sys/devices/system/cpu/cpufreq/policy*/scaling_cur_freq` |
| :arrow_down: | Download speed | `/proc/net/dev` delta |
| :arrow_up: | Upload speed | `/proc/net/dev` delta |
| R | Disk read speed | `/sys/block/mmcblk1/stat` delta |
| W | Disk write speed | `/sys/block/mmcblk1/stat` delta |
| :bar_chart: | Available memory (GB) | `/proc/meminfo` MemAvailable |

**Install:**

```bash
cp -r nova-status-extension ~/.local/share/gnome-shell/extensions/nova-status@trae

python3 -c "
import subprocess, ast
exts = ast.literal_eval(subprocess.check_output(['gsettings','get','org.gnome.shell','enabled-extensions']).decode().strip())
target = 'nova-status@trae'
if target not in exts:
    exts.append(target)
    subprocess.run(['gsettings','set','org.gnome.shell','enabled-extensions', str(exts)])
print('Done. Now run: gnome-session-quit --logout --no-prompt')
"

gnome-session-quit --logout --no-prompt
```

**Requirements:** GNOME Shell 50+, aarch64 Linux.

**Note:** GNOME 50+ user extensions require ESM format (`import` / `export default class`). Do NOT use the old `imports.gi` style.

---

## License

MIT — see [LICENSE](./LICENSE)
