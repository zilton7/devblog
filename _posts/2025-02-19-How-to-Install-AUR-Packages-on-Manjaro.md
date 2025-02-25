---
title: How to Install AUR Packages on Manjaro
categories: rails stimulus
tags: linux manjaro selfnote
---
Manjaro, based on Arch Linux, supports the Arch User Repository (AUR). Below are the steps to install AUR packages on Manjaro.

![Manjaro Desktop]({{ site.url }}{{ site.baseurl }}/assets/images/2025-02-19-How-to-Install-AUR-Packages-on-Manjaro/manjaro-kde.png)

---

## 1. Enable AUR in Manjaro

Manjaro has built-in support for AUR, but you need to enable it:

1. Open the **Add/Remove Software** tool (Pamac).
2. Go to **Preferences** > **AUR**.
3. Enable the **Enable AUR support** option.

---

## 2. Install an AUR Helper (Optional but Recommended)

An AUR helper simplifies the process of installing and managing AUR packages. Some popular AUR helpers include:

- `yay` (recommended)
- `paru`
- `pikaur`

To install `yay`, run:

{% highlight bash %}
sudo pacman -S yay
{% endhighlight %}


## 3. Install AUR Packages

Using an AUR Helper (e.g., yay)

```bash
yay -S <package-name>
```

Replace `<package-name>` with the name of the AUR package you want to install.

---

Manually (without an AUR helper)

1. Clone the AUR package repository:

```bash
git clone https://aur.archlinux.org/<package-name>.git
```

2. Navigate to the cloned directory:

```bash
cd <package-name>
```

3. Build and install the package:

```bash
makepkg -si
```


## 4. Update AUR Packages

If you're using an AUR helper like yay, you can update all installed AUR packages with:
```bash
yay -Syu
```
This will also update your regular Manjaro packages.

## 5. Troubleshooting

- If you encounter dependency issues, ensure all required dependencies are installed.

- Always review the PKGBUILD and .install files in the AUR package to ensure they are safe and trustworthy.