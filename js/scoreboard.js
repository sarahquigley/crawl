Parse.initialize("b7eMx0nuSX5fv4V06gXLNhxoftCHbk4CKSOotHCv", "cAv2gGDeORFYWTdbQC2wauxweY233NXU7i7xeOzG");

window.ScoreIt = {
  Models: {},
  Views: {},
  Collections: {},
}

ScoreIt.Models.GameScore = Parse.Object.extend("GameScore", {

  initialize: function(){
  },

  template: _.template("<tr><td><%= name %></td><td><%= country %></td><td><%= score %></td></tr>"),

  render: function(){
    return this.template(this.attributes);
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
          that.collection.reset(scores);
        },
        error: function(){
          console.log("Error: could not retrieve scores.");
        }
      });
    },

    el: "#scores",

    render: function(){
      console.log("Rendering");
      var that = this;
      _.each(this.collection.first(10), function(model){
        that.$el.append(model.render());
      });
      return this.$el;
    }

});

$(function(){
    
  ScoreboardView = new ScoreIt.Views.Scoreboard({ collection: new ScoreIt.Collections.Scoreboard()})

});
