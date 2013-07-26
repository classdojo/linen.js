
outcome = require "outcome"
type    = require "type-component"


module.exports = (options = {}) ->


    fixPath = (path) -> path.replace /\/+/g, "/"

    self = 

      ###
      ###

      host: defaultHost = options.hosts?.main or "#{window.location.protocol}//#{window.location.host}"
      
      ###
       joins two paths together
      ###

      hosts: options.hosts

      path: () ->
        path = []
        for part in arguments
          if part
            path.push part
        path.join("/")

      ###
      ###

      get: (options, next) ->
        options.method = "GET"
        self.request options, next

      ###
      ###

      post: (options, next) ->
        options.method = "POST"
        self.request options, next

      ###
      ###

      put: (options, next) ->
        options.method = "PUT"
        self.request options, next

      ###
      ###

      del: (options, next) ->
        options.method = "DELETE"
        self.request options, next

      ###
      ###

      request: (options, next) ->

        host = (options.host or self.host) 
        path = fixPath("/" + options.path)

        fet = options.method+" "+host+path
        console.log fet

        $.ajax
          url: host + path,
          type: options.method,
          dataType: "json",
          data: if /GET/.test(options.method) then undefined else JSON.parse(JSON.stringify(options.data or {})),
          error: (response) ->

            if response.responseJSON
              return next response.responseJSON

            return next comerr.fromCode response.status
            
          success: (content) ->

            if content.error
              return next content.error

            #console.log path
            #console.log JSON.stringify content, null, 2 
            #console.log JSON.stringify body, null, 2
            result = content.data or content

            next null, result

      ###
       create a router to this api transport
      ###

      route: (options = {}) ->

        host = options.host or defaultHost

        unless options.path
          options.path = (payload) ->
            return unless payload.model.schema.options.path
            return payload.model.schema.options.path(payload)

        unless options.map
          options.map = (data) -> data

        fetch = (payload, next) ->

          path = if type(options.path) is "function" then options.path.call(options, payload) else options.path

          if options.inherit isnt false
            owner = if payload.field then payload.model else payload.model.owner
            while owner and owner.schema.options.fetch?.path
              path = owner.schema.options.fetch.path({ model: owner }) + "/" + path
              break if owner.schema.options.fetch.inherit is false
              owner = owner.owner

              # break if owner?.schema.options.inherit is false

          path = fixPath path

          mapModel = (data) -> options.map.call payload.model, data

          self.request {
            host: host,
            path: path,
            data: payload.data,
            method: payload.method
          }, outcome.e(next).s (result) ->

            map = (data) => options.map.call payload.model, data

            if type(result) is "array"
              result = result.map map
            else
              result = map result

            next null, result



        fetch.path    = options.path
        fetch.inherit = options.inherit
        fetch



