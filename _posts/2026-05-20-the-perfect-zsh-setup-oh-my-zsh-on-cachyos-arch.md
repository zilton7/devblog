---
title: "The Perfect Zsh Setup: Oh My Zsh on CachyOS/Arch"
categories: selfnote
tags: [cachyos, archlinux, ohmyzsh, zsh]
image:
 path: /assets/images/2026-05-20-The-Perfect-Zsh-Setup-Oh-My-Zsh-On-Cachyos-Arch/feature.webp
---

If you want a terminal that tells you if a command is valid, predicts what you’re about to type, and shows your Git branches, follow this clean-slate guide.

## 1. Install the Foundations
Before installing the framework, we need the "Holy Trinity" of Zsh plugins and a font that can handle icons.

```bash
# Install the core plugins and Git
sudo pacman -S zsh-syntax-highlighting zsh-autosuggestions git ttf-jetbrains-mono-nerd
```

## 2. Install Oh My Zsh
Run the official script to install the framework:
```zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

## 3. The "Master" Configuration (`.zshrc`)
This is the most important part. We need to tell Zsh to load the plugins from the system folders (where Arch installs them) and hook up Ruby.

Open your config: `nano ~/.zshrc`

**Delete everything inside and paste this optimized block:**

```zsh
# 1. Path to Oh My Zsh
export ZSH="$HOME/.oh-my-zsh"

# 2. Theme (Agnoster is the best for Git branch visibility)
# Note: Requires a Nerd Font in terminal settings to see arrows/icons
ZSH_THEME="agnoster"

# 3. Core Plugins
plugins=(git ruby rbenv sudo archlinux)

# 4. Load Oh My Zsh
source $ZSH/oh-my-zsh.sh

# 5. Developer Tools (rbenv for Ruby)
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"

# 6. Pro Features (Syntax Highlighting & Autosuggestions)
# We source these manually to ensure they work perfectly on Arch/Cachy
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh

# 7. Helpful Aliases
alias yay='paru'
alias cls='clear'
```

## 4. Final Polish (Icons & Colors)

### Fix the Icons
If you see squares instead of arrows/branches:
1. Open your Terminal (Konsole/Alacritty) **Settings**.
2. Go to **Appearance** -> **Font**.
3. Select **JetBrainsMono Nerd Font**.

### Apply Changes
```zsh
source ~/.zshrc
```

---

## Why this setup is better:

### ✅ Green/Red Syntax
Type `ls`  -  it turns **green** because the command exists.
Type `asdf`  -  it turns **red** because the command is invalid. No more "command not found" surprises.

### ✅ Inline Ghost Suggestions
As you type, you'll see a **gray preview** of your last used command. Just hit the **Right Arrow** key to complete it. It's like autocomplete for your terminal.

### ✅ Smart Git Branches
The moment you `cd` into a project folder, the prompt changes to show exactly which **branch** you are on and if you have uncommitted changes.

### ✅ rbenv Integration
Ruby versions are automatically handled. If you have a `.ruby-version` file in a project, the shell switches to it immediately.

---

### Pro-Tip for CachyOS Users:
CachyOS sometimes looks for your config in `~/.config/zsh/.zshrc`. If your changes don't show up, run this to sync them:
`mkdir -p ~/.config/zsh && cp ~/.zshrc ~/.config/zsh/.zshrc`