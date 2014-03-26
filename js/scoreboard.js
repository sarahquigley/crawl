Parse.initialize("b7eMx0nuSX5fv4V06gXLNhxoftCHbk4CKSOotHCv", "cAv2gGDeORFYWTdbQC2wauxweY233NXU7i7xeOzG");

window.ScoreIt = {
  Models: {},
  Views: {},
  Collections: {},
  Live: {
    Collections: {}
  }
};

ScoreIt.Models.GameScore = Parse.Object.extend("GameScore", {

  initialize: function(){
    this.belongsTo.scoreboard = ScoreIt.Live.Collections.scoreboard ? ScoreIt.Live.Collections.scoreboard : null;
  },

  belongsTo: {
    scoreboard: null
  },

  isHighScore: function(){
    return _.include(this.belongsTo.scoreboard.first(10), this);
  },

  template: {
    show: _.template("<tr><td><%= name %></td><td><%= country %></td><td><%= score %></td></tr>"),
    form: _.template("<tr><td><input type='text' name='name'></td><td><input type='text' name='country'></td><td><%= score %></td><td><input type='submit' value='Submit'></td></tr>")
  },

  render: function(){
    if(this.isNew()){
      return this.template.form(this.attributes);
    } else {
      return this.template.show(this.attributes);
    }
  }

});

ScoreIt.Collections.Scoreboard = Parse.Collection.extend({
  model: ScoreIt.Models.GameScore,

  comparator: function(model){
    return -model.get("score");
  }

});

ScoreIt.Views.Score = Parse.View.extend({

});

ScoreIt.Views.Scoreboard = Parse.View.extend({
    
    initialize: function(){
      var that = this;
      this.collection.on("all", this.render, this);

      var query = new Parse.Query("GameScore");
      query.find({
        success: function(scores){
          that.collection.add(scores);
        },
        error: function(){
          console.log("Error: could not retrieve scores.");
        }
      });

      this.model = new ScoreIt.Models.GameScore();
    },

    events: {
      "submit #score-form": "saveScore" 
    },

    template: {
      scoreboard: "<form id='score-form'><table id='scoreboard'><thead><tr><th>Name</th><th>Country</th><th>Score</th></tr></thead><tbody id='scores'></tbody></table></form>"
    },

    el: "#scoreit",

    render: function(){
      console.log('rendering');
      var that = this;
      this.$el.html(this.template.scoreboard);
      _.each(this.collection.first(10), function(model){
        that.$el.find("#scores").append(model.render());
      });
      return this.$el;
    },

    saveScore: function(event){
      var that = this;
      event.preventDefault();
      var attrs = $(event.target).serializeJSON();
      this.model.save(attrs, {
        success: function(score){
          that.model = new ScoreIt.Models.GameScore();
        },
        error: function(score, error){
          console.log(error.message);
        }
      });
    }

});

$(function(){

  var collections = ScoreIt.Live.Collections = {
    scoreboard: new ScoreIt.Collections.Scoreboard()
  };
    
  ScoreboardView = new ScoreIt.Views.Scoreboard({ collection: collections.scoreboard });

  ScoreboardView.model.set("score", "100"); 
  collections.scoreboard.add(ScoreboardView.model);

  /*m = new ScoreIt.Models.Score({name: 'Moo', country: 'Mooland', score: 100});
  m.save(null, {});*/

});
