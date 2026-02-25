---
title: How to Use Form Validations in Dialog with NitroKit
categories: selfnote
tags: rails nitrokit turbo_stream hotwire
image:
    feature: /assets/images/2025-05-26-How to-Use-Form-Validations-in-Dialog-with-NitroKit/form.webp
---

I've ran into issues trying to validate form inside dialog component using [NitroKit](https://nitrokit.dev) UI components. The dialog kept closing on every submission, the solution that worked was wraping form in turbo_frame_tag.


```ruby
# the controller
class PostsController < ApplicationController
    ...

    def new
    @post = Post.new
    end

    def create
    @post = Post.new(post_params)

        if @post.save
        ...
        else
        respond_to do |format|
            format.turbo_stream do
            render turbo_stream: turbo_stream.replace("post_form",
                                                        partial: 'form',
                                                        locals: { post: @post })
            end
        end
        end

    end
    ...
end
```

On save error, the controller renders form with errors via turbo stream, without refreshing the page or closing the dialog.


```erb
# the form partial
<%= turbo_frame_tag "post_form" do %>
    <%= nk_form_with model: post, url: request.path do |f| %>
        ...
    <% end %>
<% end %>

```

The same form partial is used by controller when rendering error and by dialog component when trigger button is clicked


```erb
# the dialog component
<%= nk_dialog do |d| %>
    <%= d.trigger "Add Post", variant: :primary %>
        <%= d.dialog do %>
        <%= render 'form', post: @post %>
        <%= d.close_button %>
    <% end %>
<% end %>
```

and the model has the usual rails validations.


