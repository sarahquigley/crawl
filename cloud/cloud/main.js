Parse.Cloud.define("getScoreboard", function(request, response){

  var query = new Parse.Query("GameScore");

  query.find({
    success: function(scores){
      response.success(scores);
    },
    error: function(){
      response.error("error finding scores");
    }
  });
});

