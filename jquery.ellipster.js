// (c) 2014 Jean Lescure
// jQuery.ellipster may be freely distributed under the MIT license.

(function($) {
    var ellipsis_methods = {
        init: function(options) {
          // default option
          var defaults = {
            'rows' : 1, // show rows
            'word_only': false, // set to true to avoid cutting the text in the middle of a word
            'chars' : '...', // ellipsis
            'callback': function() {},
            'position': 'tail', // middle, tail
            'link_ellipsis': false
          };

          options = $.extend(defaults, options);
          
          ellipsis_methods.render_ellipsis.apply(this, [options]);
        },
        render_ellipsis: function(options) {
          this.each(function() {
            var $this = $(this);
            $this.css( 'word-wrap', 'break-word' );
            if ($this.css( 'white-space' ) === 'nowrap')
            {
              $this.css( 'white-space', 'normal' );
            }
            
            // get element text
            var text = $this.text();
            var origText = text;
            var origLength = origText.length;
            var origHeight = $this.height();
            var chars = options['chars'];
            
            $this.data('original_content', origText);
            $this.data('ellipsis_options', options);
            if (options['link_ellipsis']) chars = '<a class="ellipsis" href="#">' + chars + '</a>';

            // get height
            $this.text('a');
            var lineHeight =  parseFloat($this.css("lineHeight"), 10);
            var rowHeight = $this.height();
            var gapHeight = lineHeight > rowHeight ? (lineHeight - rowHeight) : 0;
            var targetHeight = $this.data('target_height') || gapHeight * (options.rows - 1) + rowHeight * options.rows;
            $this.data('target_height', targetHeight);

            if (origHeight <= targetHeight || origText === '') {
              //console.log([origHeight,targetHeight,text]);
              $this.text(text);
              options.callback.call(this);
              
              $this.css( 'word-wrap', '' );
              $this.css( 'white-space', '' );
              return;
            }

            var start = 1, length = 0;
            var end = text.length;

            if(options.position === 'tail') {
              while (start < end) { // Binary search for max length
                length = Math.ceil((start + end) / 2);

                if(options['link_ellipsis']){
                  $this.html(text.slice(0, length) + chars);
                }else{
                  $this.text(text.slice(0, length) + chars);
                }

                if ($this.height() <= targetHeight) {
                    start = length;
                } else {
                    end = length - 1;
                }
              }

              text = text.slice(0, start);

              if (options.word_only) {
                text = text.replace(/[\u00AD\w\uac00-\ud7af]+$/, ''); // remove fragment of the last word together with possible soft-hyphen characters
              }
              text += chars;
            }else if(options.position === 'middle') {
              var sliceLength = 0;
              while (start < end) { // Binary search for max length
                length = Math.ceil((start + end) / 2);
                sliceLength = Math.max(origLength - length, 0);
                if (options['link_ellipsis']){
                  $this.html(
                    origText.slice(0, Math.floor((origLength - sliceLength) / 2)) +
                           chars +
                           origText.slice(Math.floor((origLength + sliceLength) / 2), origLength)
                  );
                }else{
                  $this.text(
                    origText.slice(0, Math.floor((origLength - sliceLength) / 2)) +
                           chars +
                           origText.slice(Math.floor((origLength + sliceLength) / 2), origLength)
                  );
                }

                if ($this.height() <= targetHeight) {
                  start = length;
                } else {
                  end = length - 1;
                }
              }

              sliceLength = Math.max(origLength - start, 0);
              var head = origText.slice(0, Math.floor((origLength - sliceLength) / 2));
              var tail = origText.slice(Math.floor((origLength + sliceLength) / 2), origLength);

              if (options.word_only) {
                // remove fragment of the last or first word together with possible soft-hyphen characters
                head = head.replace(/[\u00AD\w\uac00-\ud7af]+$/, '');
              }

              text = head + chars + tail;
            }
            
            if(options['link_ellipsis']){
              $this.html(text);
            }else{
              $this.text(text);
            }

            options.callback.call(this);
            $this.data('ellipsis_content', $this.html());
            
            $this.css( 'word-wrap', '' );
            $this.css( 'white-space', '' );
          });

          return this;
        },
        update_ellipsis: function(){
          var $this = $(this);
          if ($this.html() !== $this.data('ellipsis_content')){
            ellipsis_methods.render_ellipsis.apply(this, [$this.data('ellipsis_options')]);
            //console.log('updated');
          }
        }
    };
    
    $.fn.ellipster = function(methodOrOptions) {
        if ( ellipsis_methods[methodOrOptions] ) {
            return ellipsis_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return ellipsis_methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.ellipster' );
        }    
    };
}) (jQuery);