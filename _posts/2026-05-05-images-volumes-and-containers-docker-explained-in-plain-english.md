---
title: "Images, Volumes, and Containers: Docker Explained in Plain English"
categories: selfnote
tags: [docker, devops, webdev, beginners]
image:
 path: /assets/images/2026-05-05-Images-Volumes-And-Containers-Docker-Explained-In-Plain-English/feature.webp
---

Very often I see developers completely give up on learning Docker because of the vocabulary. 

You read a tutorial and the author says: *"Just build the Dockerfile into an Image, mount the Volume, map the Ports, and spin up the Container."* If you don't have a DevOps background, that sounds like alien gibberish.

The truth is, Docker is incredibly simple. It is just a virtual "shipping box" for your code. But because the creators of Docker invented their own terminology, it feels intimidating.

If you want to deploy modern web apps (especially using tools like Kamal 2), you need to know what these words actually mean. Here is the absolute simplest translation of Docker jargon into plain English.

## 1. The Dockerfile (The Recipe)

Imagine you are opening a bakery. The `Dockerfile` is your master recipe book.

It is literally just a plain text file. It contains a list of instructions on exactly how to build your application's environment from a completely blank slate. 

It says:
1. Buy an oven (Install Linux).
2. Buy some flour (Install Ruby/Node.js).
3. Bring in the secret ingredients (Copy your app's code).
4. Mix it all together (Run `bundle install` or `npm install`).

A `Dockerfile` doesn't *do* anything on its own. It is just a piece of paper waiting to be read.

## 2. The Image (The Frozen Cake)

When you run the command `docker build`, Docker reads your recipe (the `Dockerfile`) and goes to work. 

When it finishes all the steps, it takes a massive, frozen snapshot of the entire system. This snapshot is called an **Image**. 

*   An Image is **read-only**. You cannot change the code inside an Image once it is built.
*   It is heavy. It might be 500MB or 1GB because it contains a whole mini-operating system.
*   Think of the Image as the CD-ROM of a video game. The CD holds all the game files, but the CD itself doesn't "play" the game until you put it in a console.

## 3. The Container (The Running Machine)

This is the word people get confused by the most. 

If the Image is the CD-ROM, the **Container** is the game actually running on your TV. 

When you run the command `docker run`, Docker takes your frozen Image, wakes it up, gives it some RAM and CPU power, and turns it into a living, breathing **Container**. 

*   You can run **10 Containers** from **1 Image**. (Just like you can install the same CD-ROM onto 10 different computers).
*   Containers are completely isolated from your actual laptop. They think they are the only thing existing in the universe.

## 4. Volumes (The USB Flash Drive)

Here is the most dangerous thing about Containers: **They have amnesia.**

If your Container is running your database (like PostgreSQL or SQLite), and you restart the Container or it crashes, **all your data is permanently deleted.** A Container always wakes up looking exactly like the original, frozen Image.

To solve this, we use **Volumes**. 

A Volume is like a USB Flash Drive that you plug into the side of the Container. You tell Docker: *"Hey, whenever the database saves a file, don't save it inside the Container's memory. Save it onto this USB drive."*

This way, if the Container explodes and dies, your data is safe on the Volume. When you boot up a brand new Container tomorrow, you just plug that same Volume back in, and your database is exactly where you left off.

## 5. Ports (The Doors)

As I mentioned earlier, Containers are isolated. They are like locked bank vaults.

If you have a Rails or Node app running on port 3000 *inside* the Container, and you open your browser to `http://localhost:3000` on your Mac, it won't work. Your Mac cannot see inside the vault.

You have to punch a hole in the wall. This is called **Port Mapping**. 

When you start the container, you pass a flag like `-p 8080:3000`. This tells Docker:
*"If anyone knocks on door 8080 of my actual laptop, open a secret tunnel and send them to door 3000 inside the Container."*

## 6. The Registry (The App Store)

Finally, how do you get your Image from your laptop to your production server? You use a **Registry**.

A Registry is just Dropbox for Docker Images. The most famous one is Docker Hub, but GitHub has one too (GHCR). 

The workflow is simple:
1. You build the Image on your laptop.
2. You `docker push` the Image up to the Registry.
3. You log into your cheap $5 cloud server.
4. You `docker pull` the Image down from the Registry.
5. You run it.

*(Side note: This exact 5-step process is what deployment tools like **Kamal** do automatically for you!)*

## Summary

Don't let the DevOps gatekeepers confuse you. The mental model is actually very logical:

*   **Dockerfile:** The blueprint.
*   **Image:** The frozen snapshot built from the blueprint.
*   **Container:** The running instance of the snapshot.
*   **Volume:** The external hard drive to save your data.
*   **Ports:** The tunnels to let internet traffic inside.
*   **Registry:** The cloud storage to hold your snapshots.

Once these terms click in your brain, Docker stops being a scary black box and becomes the most reliable tool in your entire development stack.