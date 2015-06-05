# field tag for Ext.data.Model documentation
# Discussion: https://github.com/senchalabs/jsduck/issues/113
# Custom member types: https://github.com/senchalabs/jsduck/wiki/Custom-member-types

require "jsduck/tag/member_tag"

class Field < JsDuck::Tag::MemberTag
  def initialize
    @tagname = :field
    @pattern = "field"
    @member_type = {
      :title => "Fields",
      :position => MEMBER_POS_CFG - 0.1,
      :icon => File.dirname(__FILE__) + "/db-icon.png"
    }
  end

  def parse_doc(scanner, position)
    tag = scanner.standard_tag({
        :tagname => :field,
        :type => true,
        :name => true,
        :default => true,
        :optional => true
      })
    tag[:doc] = :multiline
    tag
  end

  def process_doc(context, field_tags, position)
    p = field_tags[0]
    # Type might also come from @type, don't overwrite it with nil.
    context[:type] = p[:type] if p[:type]
    context[:default] = p[:default]

    # Documentation after the first @property is part of the top-level docs.
    context[:doc] += p[:doc]
    context[:name] = p[:name]
  end

  def to_html(field, cls)
    member_link(field) + ': ' + field[:html_type]
  end
end
