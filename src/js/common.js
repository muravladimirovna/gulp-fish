function initDraggable() {

	questionsList.rightAnswers = 0;

	$( ".draggable" ).draggable({ 
		revert: "invalid", 
		revertDuration: 400,
		containment: "#container",
		tolerance: "pointer",
		axis:"x",
	});

	$(".draggable").on( "drag", function(event, ui){
	    $(this).css("transform", "rotate(" + ui.position.left / 10 + "deg)");
	    ui.position.top = (ui.position.left * ui.position.left / 2500 ) - 10;
	});

	$(".draggable").on( "dragstart", function(event, ui){

		var index = parseInt($(this).removeClass("first").data("index"));

		$(".draggable").removeClass("first second third");
		$(".draggable[data-index='" + (index + 1) + "']").addClass("first");
		$(".draggable[data-index='" + (index + 2) + "']").addClass("second");
		$(".draggable[data-index='" + (index + 3) + "']").addClass("third");
	});

	$(".draggable").on( "dragstop", function(event, ui){

		if($(this).hasClass("_empty")) {

			$(this).addClass("first").css({
    			left: 0,
    			top: 0,
    			transition: 'none',
	    	});

			$(".draggable").removeClass("first second third");
			$(this).addClass("first");
			$(".draggable[data-index='" + (parseInt($(this).data("index")) + 1) + "']").addClass("second");
			$(".draggable[data-index='" + (parseInt($(this).data("index")) + 2) + "']").addClass("third");

		};

	});


	$( ".droppable" ).droppable({
		classes: {
			"ui-droppable-active": "ui-state-active",
			"ui-droppable-hover": "ui-state-hover"
		},
		drop: function(event, ui) {

			var item = $(ui.draggable);
			item.draggable( "option", "disabled", true );
			item.removeClass("_empty").addClass("_finish").css({
				"transform": item.css("transform") + " scale(.2)",
				// "z-index": item.data("index"),
			});

			if(item.data("for") == $(this).data("result")) questionsList.rightAnswers++;

			checkRusult();
		}

	});

};

function checkRusult() {
	if($(".draggable__item._empty").length < 1) {
		var result = questionsList.rightAnswers == questionsList.answersCount ? resultSuccess() : $(".draggable__result.error").show();

		$("._draggable__result").removeClass("_hidden");
		$("._yota_test_wrapper").addClass("_result");

		// setTimeout(()=>{ refreshDraggable() }, 500)
	}
}

function resultSuccess() {
	$(".draggable__result.success").show();
	destroyDraggable();
	setTimeout(()=>{
		$(".draggable-wrapper").addClass("success_result");
	});
}

function destroyDraggable() {

	$("._draggable__result").addClass("_hidden");
	$(".droppable").droppable("destroy");
	$(".draggable").draggable("destroy").removeAttr("style").hide().css({transform: "scale(0)!important"})
	.removeClass("first second third _ampty _finish").addClass("_empty");
}

function refreshDraggable() {

	destroyDraggable();

	setTimeout(()=>{
		$(".draggable[data-index='0']").addClass("first");
		$(".draggable[data-index='1']").addClass("second");
		$(".draggable[data-index='2']").addClass("third");
		$(".draggable-wrapper").removeAttr("style");
		$("._yota_test_wrapper").removeClass("_result");
		questionsList.getQuestions();
		$(".draggable").show();
	}, 500);

	setTimeout( $(".draggable").removeAttr("style"), 1000 );
}

Vue.component('list-item', {
	props: ['todo', 'index'],
	template: `<div v-bind:data-for="todo.result" 
					v-bind:data-index="questionsList.getIndex(index)"
					v-bind:class="questionsList.getClass(index)">
		            <h3>{{ todo.text }}</h3>
		            <span class="number">
		            	<span class="num">{{ questionsList.getIndex(index)+1 }}</span> из <span class="all">{{ questionsList.answersCount }}</span>
		            </span>
		        </div>`
});

Vue.component('error-item', {
	props: ['index', 'plural', 'count'],
	template: `<div class="draggable__result draggable__card error">
	        		<h3>УПС...<br>НЕ ВЫШЛО</h3>
	        		<p>Ты справился всего лишь<br> {{ index }} {{ plural }} из {{ count }}. Попробуешь еще раз?</p>
	        		<button class="refresh" onclick="refreshDraggable()">
	        			<img src="/images/refresh.svg" alt="">
	        		</button>
	        		<div class="draggable__result-decore draggable__result-before draggable__card"></div>
	        		<div class="draggable__result-decore draggable__result-after draggable__card"></div>
	        	</div>`
});

var questionsList = new Vue({
    el: '#questions',
    data: {
        questions: [ ],
        rightAnswers: 0,
        answersCount: 15,
    },
    methods: {
	    getClass: function (index) {
	    	var classOf = "";
	    	classOf = index == (this.answersCount-1) ? "first" : classOf;
	    	classOf = index == (this.answersCount-2) ? "second" : classOf;
	    	classOf = index == (this.answersCount-3) ? "third" : classOf;
	      	return "draggable__item draggable__card draggable ui-widget-content _empty " + classOf;
	    },
	    getIndex: function (index) {
	      return (this.answersCount-1)-index;
	    },
	    pluralForm: function (index) {
	    	return index > 1 && index < 5 ? 'раза' : 'раз';
	    },
        getQuestions: function () {
	        $.ajax("/data/test.json").then((data)=>{
	        	if(typeof(data) == "object") {
	            	this.questions = data.sort(function(){return 0.5 - Math.random()}).slice(0, this.answersCount);
					setTimeout(()=>{
						initDraggable();
					}, 500 );
				}
	        });
        },
    },
    created: function() {
        this.getQuestions();
    }
});

