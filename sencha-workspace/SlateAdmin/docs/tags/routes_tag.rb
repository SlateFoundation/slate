require "jsduck/tag/member_tag"

class Route < JsDuck::Tag::MemberTag
  def initialize
    @tagname = :route
    @pattern = "route"
    @member_type = {
        :title => "Routes",
        :position => MEMBER_POS_CFG + 1,
        :icon => File.dirname(__FILE__) + "/icons/route.png",
    }
  end

  def parse_doc(scanner, position)
    routename = scanner.match(/.*/)
    return {
        :tagname => :route,
        :name => routename,
        :doc => :multiline
    }
  end

  def process_doc(context, route_tags, position)
    context[:name] = route_tags[0][:name]
    context[:doc] = route_tags[0][:doc]
  end

  def format(context, formatter)
    context[:route].each do |route|
      route[:doc] = formatter.format(route[:doc])
    end
  end

  def to_html(route, cls)
    #member_link(route) + member_params(route[:params])
    return [
      member_link(route),
      route[:params] ? " " + member_params(route[:params]) : ""
    ]
  end
end
