---
title:  How to Add an Already Committed File to Gitignore
tags: git github selfnote
---
If you've already committed a file to Git and want to add it to `.gitignore`, follow these steps.

![Cover Image of the Article]({{ site.url }}{{ site.baseurl }}/assets/images/2025-02-19-How-to-Add-an-Already-Committed-File-to-gitignore/main_image.png)

## 1. Add the file to `.gitignore`  
   Open your `.gitignore` file (or create one if it doesn't exist) and add the file or directory you want to ignore. For example:

```bash
path/to/file.txt
```

## 2. Remove the file from Git's tracking
To stop Git from tracking the file (but not delete it from your filesystem), run:

```bash
git rm --cached path/to/file.txt
```

## 3. Commit the change
Commit the change to remove the file from version control:
```bash
git commit -m "Stop tracking file.txt and add it to .gitignore"
```

## 4. Push the changes
Finally, push the changes to your remote repository:
```bash
git push
```

Now the file will be ignored by Git, and it won't be tracked in future commits.