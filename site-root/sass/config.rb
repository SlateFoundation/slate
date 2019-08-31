# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
sass_dir = "."

css_dir = "../css"
http_stylesheets_path = "/css"

images_dir = "../img"
http_images_path = "/img"

javascripts_dir = "../js"
http_javascripts_path = "/js"

fonts_dir = "../fonts"
http_fonts_path = "/fonts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :expanded

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass


# use SHA1 cachebuster
asset_cache_buster do |http_path, real_path|
    if File.exists?(real_path)
        "_sha1=%s" % [Digest::SHA1.file(real_path).hexdigest]
    end
end