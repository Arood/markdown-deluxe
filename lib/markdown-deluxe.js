var CompositeDisposable = require('atom').CompositeDisposable,
    fs = require('fs'),
    path = require('path');

// TODO: Clean up after deactivation
if (!this.grammarsAdded) {
  var addGrammars = function() {
    var grammar = atom.grammars.grammarsByScopeName['source.gfm'];
    if (!grammar || !grammar.rawPatterns) {
        setTimeout(addGrammars.bind(this), 500);
        console.log('Grammar not yet available, trying again in 0.5s');
        return;
      }
      var grammar = atom.grammars.grammarsByScopeName['source.gfm'];
      var patterns = grammar.rawPatterns;
      console.log(patterns);

      patterns.push({
        begin: "^([\\s]{4,})",
        end: "$",
        name: "markup.raw.gfm"
      });

      patterns.push({
        begin: "(</?)",
        end: "(>)",
        name: "markup.raw.gfm"
      });

  };addGrammars();

  this.grammarsAdded = true;
}

var Run = {
  generateConfig: function() {

    var style = document.querySelector("#markdown-deluxe-custom-styles");

    if (!style) {
      style = document.createElement("style");
      style.setAttribute("id", "markdown-deluxe-custom-styles");
      document.body.appendChild(style);
    }

    var fontFamily = atom.config.get('markdown-deluxe.fontFamily'),
        fontSize = atom.config.get('markdown-deluxe.fontSize'),
        editorFontFamily = atom.config.get('editor.fontFamily'),
        editorFontSize = atom.config.get('editor.fontSize'),
        maxWidth = atom.config.get('markdown-deluxe.width');

var styles = `[data-markdown-deluxe="true"] {
  max-width: ${maxWidth};
  font: ${fontSize} ${fontFamily};
}

[data-markdown-deluxe="true"]::shadow .markup.raw {
  font-size: ${editorFontSize}px;
  font-family: ${editorFontFamily};
}`;

    style.innerHTML = styles;

  },
  start: function() {
    return requestAnimationFrame(function() {
      var characterWidth, charactersPerLine, currentScope, editor, scopes;
      scopes = atom.config.get('markdown-deluxe.scopes').split(',');
      editor = atom.workspace.getActiveTextEditor();
      Run.generateConfig();
      if (editor !== void 0) {
        currentScope = editor.getRootScopeDescriptor().scopes[0];
        if (scopes.indexOf(currentScope) >= 0) {
          characterWidth = editor.getDefaultCharWidth();
          atom.config.set('editor.softWrap', true, {
            scopeSelector: currentScope
          });
          return atom.views.getView(editor).setAttribute('data-markdown-deluxe', true);
        }
      }
    });
  },
  stop: function() {
    Array.prototype.slice.call(document.querySelectorAll('[data-markdown-deluxe]')).forEach(function(el) {
      el.setAttribute('data-markdown-deluxe', false);
    });
  }
};

module.exports = {
  config: {
    scopes: {
      description: 'Comma separated, no spaces. Find the scope for each language in its package.',
      type: 'string',
      "default": 'source.gfm,text.html.mediawiki'
    },
    fontFamily: {
      "description": "Code blocks will inherit the editor font.",
      "type": 'string',
      "default": 'Georgia'
    },
    fontSize: {
      "description": 'Including line-height.',
      "type": 'string',
      "default": '16px/1.7'
    },
    width: {
      "type": 'string',
      "default": '45em'
    }
  },
  activate: function(state) {
    this.disposables = new CompositeDisposable;
    Run.start();
    this.disposables.add(atom.config.onDidChange('markdown-deluxe.scopes', function() {
      return Run.stop();
    }));
    this.disposables.add(atom.config.onDidChange('markdown-deluxe.fontFamily', function() {
      return Run.stop();
    }));
    this.disposables.add(atom.config.onDidChange('markdown-deluxe.fontSize', function() {
      return Run.stop();
    }));
    this.disposables.add(atom.config.onDidChange('markdown-deluxe.width', function() {
      return Run.stop();
    }));
    this.disposables.add(atom.config.onDidChange('editor.fontFamily', function() {
      return Run.start();
    }));
    this.disposables.add(atom.config.onDidChange('editor.fontSize', function() {
      return Run.start();
    }));
    return this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
      return function() {
        var editor;
        Run.start();
        editor = atom.workspace.getActiveTextEditor();
        if (editor !== void 0) {
          return _this.disposables.add(editor.onDidChangeGrammar(function() {
            atom.views.getView(editor).setAttribute('style', '');
            atom.views.getView(editor).setAttribute('data-markdown-deluxe', false);
            return Run.start();
          }));
        }
      };
    })(this)));

  },
  deactivate: function(state) {
    Run.stop();
    return this.disposables.dispose();
  }
};
