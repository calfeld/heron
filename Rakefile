EXTERNALS = [
  [ "http://coffeescript.org/extras/coffee-script.js", "coffee-script.js" ],
  [ "http://d3lp1msu2r81bx.cloudfront.net/kjs/js/lib/kinetic-v4.7.1.js", "kinetic.js" ],
  [ "http://code.jquery.com/jquery-2.0.3.js", "jquery.js" ]
]
EXTERNAL_DIR = "external"
DOC_DIR      = "doc"

task :default => [:fetch_external, :doc]

task :fetch_external do
  require 'net/http'
  require 'fileutils'

  FileUtils.mkdir_p(EXTERNAL_DIR)

  rake_mtime = File.mtime( __FILE__ )
  EXTERNALS.each do |uri, short|
    uri = URI( uri )
    long = File.basename( uri.path )
    long_path = File.join( EXTERNAL_DIR, long )
    short_path = File.join( EXTERNAL_DIR, short )

    update = false
    if ! File.exists?( long_path )
      puts "Downloading #{uri}"
      File.open( long_path, "w") do |out|
        out.print Net::HTTP.get( uri )
      end
      update = true
    end

    if short_path != long_path && ( ! File.exists?( short_path ) || update )
      puts "Linking to #{short_path}"
      FileUtils.ln( File.expand_path( long_path ), short_path )
    end
  end
end

task :doc do
  require 'fileutils'

  codo_dir = File.join(DOC_DIR,  'codo')
  yard_dir = File.join(DOC_DIR,  'yard')
  FileUtils.mkdir_p(DOC_DIR)
  sh "codo -v -o #{codo_dir} --title Heron"
  sh "yard --verbose -o #{yard_dir} '**/*.rb'"
  sh "yard stats --list-undoc '**/*.rb'"
end
