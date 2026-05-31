# RKNova_self_miscellaneous

Random experiments & tools for my **Indiedroid Nova** (RK3588S, Armbian).

---

## 🛠️ Tools

### 🔥 nova-status-extension

A minimal GNOME Shell extension that displays real-time system stats on the top bar — designed for RK3588's big.LITTLE architecture.

```
🔥52°C 🎛️2.4/1.8G ↓12K ↑3K R0B W1.2M 📊9.3G
```

| Icon | Meaning | Source |
|------|---------|--------|
| 🔥 | Package temperature | `/sys/class/thermal/thermal_zone0/temp` |
| 🎛️ | Big/LITTLE core freq avg | `/sys/devices/system/cpu/cpufreq/policy*/scaling_cur_freq` |
| ↓ | Download speed | `/proc/net/dev` delta |
| ↑ | Upload speed | `/proc/net/dev` delta |
| R | Disk read speed | `/sys/block/mmcblk1/stat` delta |
| W | Disk write speed | `/sys/block/mmcblk1/stat` delta |
| 📊 | Available memory | `/proc/meminfo` MemAvailable |

**Install:**

```bash
# Copy to GNOME extensions dir
cp -r nova-status-extension ~/.local/share/gnome-shell/extensions/nova-status@trae

# Enable via gsettings
python3 -c "
import subprocess, ast
exts = ast.literal_eval(subprocess.check_output(['gsettings','get','org.gnome.shell','enabled-extensions']).decode().strip())
target = 'nova-status@trae'
if target not in exts:
    exts.append(target)
    subprocess.run(['gsettings','set','org.gnome.shell','enabled-extensions', str(exts)])
print('Done. Now run: gnome-session-quit --logout --no-prompt')
"

# Log out & back in
gnome-session-quit --logout --no-prompt
```

**Requirements:** GNOME Shell 50+, aarch64 Linux, `/sys` and `/proc` access.

---

## License

MIT — see [LICENSE](./LICENSE)
