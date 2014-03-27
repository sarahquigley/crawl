Parse.initialize("b7eMx0nuSX5fv4V06gXLNhxoftCHbk4CKSOotHCv", "cAv2gGDeORFYWTdbQC2wauxweY233NXU7i7xeOzG");

// ScoreIt
window.ScoreIt = {
  Models: {},
  Views: {},
  Collections: {},
  Live: {
    Collections: {},
    Views: {}
  },

  create: function(el){
    this.Live.Collections.scoreboard = new this.Collections.Scoreboard();
    this.Live.Views.scoreboard = new ScoreIt.Views.Scoreboard({ collection: this.Live.Collections.scoreboard, el: el });
  },
  
  isVisible: function(){
    return this.Live.Views.scoreboard.isVisible;
  },

  registerScore: function(score){
    this.Live.Views.scoreboard.registerScore(score);
  }
};


// GameScore
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
    show: _.template("<tr class='new-score'><td><%= name %></td><td><%= country %></td><td><%= score %></td></tr>"),
    form: _.template("<tr class='score'><td><input type='text' name='name'></td><td><input type='text' name='country'></td><td><%= score %></td></tr><td></td><td></td><td><input type='submit' value='Submit'></td></tr>")
  },

  render: function(){
    if(this.isNew()){
      return this.template.form(this.attributes);
    } else {
      return this.template.show(this.attributes);
    }
  }

});

// Scoreboard
ScoreIt.Collections.Scoreboard = Parse.Collection.extend({
  model: ScoreIt.Models.GameScore,

  comparator: function(model){
    return -model.get("score");
  }

});

//Scoreboard View
ScoreIt.Views.Scoreboard = Parse.View.extend({
    
    initialize: function(el){
      var that = this;

      this.el = el;
      this.model = new ScoreIt.Models.GameScore();
      this.isVisible = false;
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
    },

    events: {
      "submit #score-form": "saveScore",
      "click .toggle-scoreboard": "toggleScoreboard"
    },

    template: {
      scoreboard: "\
        <div id='scoreit'>\
          <button class='toggle-scoreboard'>View High Scores</button>\
          <div id='scoreit-container' style='display: none'>\
            <div id='scoreit-scoreboard'>\
              <h2>Top Scores!</h2>\
              <button class='toggle-scoreboard'></button>\
              <form id='score-form'>\
                <table>\
                  <thead><tr><th>Name</th><th>Country</th><th>Score</th></tr></thead>\
                  <tbody id='scores'></tbody>\
                </table>\
              </form>\
            </div>\
          </div>\
        </div>"
    },

    render: function(){
      console.log('rendering');
      var that = this;
      this.$el.html(this.template.scoreboard);
      _.each(this.collection.first(10), function(model){
        that.$el.find("#scores").append(model.render());
      });
      return this.$el;
    },

    toggleScoreboard: function(){
      $el = this.$el.find("#scoreit-container");
      if ( $el.css("display") === "none" ) {
        this.isVisible = true;
        $el.css("display", "");
      } else {
        $el.css("display", "none");
        this.isVisible = false;
        this.collection.remove(this.model);
      }
    },

    registerScore: function(score){
      this.model.set("score", score.toString());
      this.collection.add(this.model);
      if ( this.model.isHighScore() ){
        this.toggleScoreboard();
      } else {
        this.collection.remove(this.model);
      }
    },

    saveScore: function(event){
      var that = this;
      event.preventDefault();
      var attrs = $(event.target).serializeJSON();
      this.model.save(attrs, {
        success: function(score){
          that.model = new ScoreIt.Models.GameScore();
          that.collection.trigger('add');
          that.toggleScoreboard();
        },
        error: function(score, error){
          console.log(error.message);
        }
      });
    }

});
