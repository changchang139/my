$(function () {
  // initialize the external events----------------------------------------------
  function ini_events(ele) {
    ele.each(function () {
      // create an Event Object (https://fullcalendar.io/docs/event-object)
      // it doesn't need to have a start or end
      var eventObject = {
        title: $.trim($(this).text()), // use the element's text as the event title
      };

      // store the Event Object in the DOM element so we can get to it later
      $(this).data("eventObject", eventObject);

      // make the event draggable using jQuery UI
      $(this).draggable({
        zIndex: 1070,
        revert: true, // will cause the event to go back to its
        revertDuration: 0, //  original position after the drag
      });
    });
  }

  ini_events($("#external-events div.external-event"));

  //  initialize the calendar------------------------------------------------------------
  //Date for the calendar events (dummy data)
  var date = new Date();
  // var d = date.getDate(),
  //   m = date.getMonth(),
  //   y = date.getFullYear();

  var Calendar = FullCalendar.Calendar;
  var Draggable = FullCalendar.Draggable;

  var containerEl = document.getElementById("external-events");
  var calendarEl = document.getElementById("calendar");

  // initialize the external events---------------------------------------------------

  new Draggable(containerEl, {
    itemSelector: ".external-event",
    eventData: function (eventEl) {
      return {
        title: eventEl.innerText,
        backgroundColor: window
          .getComputedStyle(eventEl, null)
          .getPropertyValue("background-color"),
        borderColor: window
          .getComputedStyle(eventEl, null)
          .getPropertyValue("background-color"),
        textColor: window
          .getComputedStyle(eventEl, null)
          .getPropertyValue("color"),
      };
    },
  });

  var calendar = new FullCalendar.Calendar(calendarEl, {
    //調月曆長度=============================
    // height: 530,

    //轉中文================================
    initalView: "dayGridMonth",
    locale: "zh-tw",
    navlinks: true,
    //月曆頁面表頭，工具列===================
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "",
    },
    buttonText: {
      today: "今天",
    },
    themeSystem: "bootstrap",

    //選擇日期，跳表單框==================================
    dateClick: function (data, event, view) {
      //顯示編輯畫面事件
      // $("#eventFormButtonsure").data("key", data.id);//事件確認按鈕，綁定事件ID
      // $("#eventFormButtonreremove").data("key", data.id);//事件刪除按鈕，綁定事件ID
      $("#dateInput").val(moment(data.date).format("YYYY-MM-DD")); //事件日期，預設填入被點選的日期，不得修改
      // $("#nameInput").val(data.eventItem).trigger("change");//事件類型，下拉選單，選單內容為：花花、泡泡、毛毛
      // $("#eventTimeInput").val(data.eventItem).trigger("change");//事件類型，下拉選單，選單內容為：早班、晚班
      // $("#relaxInput").val(data.eventItem).trigger("change");//事件類型，下拉選單，選單內容為：基本假、特休、事假、其他
      // $("#eventFormModalTitle").text("");//修改modal標題名稱
      // $("#eventFormButtonreremove").show();//顯示刪除按鈕
      $("#eventFormModal").modal("show"); //顯示編輯視窗，供使用者編輯
    },
  });

  //抓日期======================================
  var eventa = calendar.getEvents();
  console.log(eventa);

  eventa.forEach(function (element) {
    var evId = element["_def"]["publicId"];
    var even = calendar.getEventById(evId);
    console.log(even.title);
    console.log(even.start.toISOString());
  });
  calendar.render();

  //取消按鍵，返回初始值====================================方法一
  var input = document.querySelector("#eventFormButtonCancel");
  input.addEventListener("click", function () {
    document.getElementById("nameInputla").options.selectedIndex = 0;
    $("#nameInputla").selectpicker("refresh");
  });
  input.addEventListener("click", function () {
    document.getElementById("eventTimeInputla").options.selectedIndex = 0;
    $("#eventTimeInputla").selectpicker("refresh");
  });
  input.addEventListener("click", function () {
    document.getElementById("relaxInputla").options.selectedIndex = 0;
    $("#relaxInputla").selectpicker("refresh");
  });

  //x按鍵，返回初始值==========================================方法二
  document.querySelector("#inputxxx").addEventListener("click", function (e) {
    document.querySelector("#nameInputla").value = 0;
    document.querySelector("#eventTimeInputla").value = 0;
    document.querySelector("#relaxInputla").value = 0;
  });

  // 確定按鍵，資料呈現==================================
  var currevents = document
    .getElementById("eventFormButtonsure")
    .addEventListener("click", function (e) {
      var dateInput = $("#dateInput");
      var optionname = $("#nameInputla option:selected");
      var optiontime = $("#eventTimeInputla option:selected");
      var optionrelax = $("#relaxInputla option:selected");
      // alert(optionname.text());
      // console.log(dateInput.val())
      // console.log(optionname.val())

      //選單正確填入，判斷
      var errorMsg = "";
      var errorflag = false;
      if (optionname.val() == "0") {
        errorMsg += "請選擇正確姓名\n";
        errorflag = true;
      }
      if (optiontime.val() == "0") {
        errorMsg += "請選擇正確班別\n";
        errorflag = true;
      }
      if (optionrelax.val() == "0") {
        errorMsg += "請選擇正確假別\n";
        errorflag = true;
      }
      if (errorflag) {
        //在第一次表單輸入成功後，第二次填選資料，表單也不會收合
        document
          .getElementById("eventFormButtonsure")
          .removeAttribute("data-dismiss");
        alert(errorMsg);
      } else {
        //顏色分假別
        var dayoffcolor;
        var relax = optionrelax.val();
        var s_reduce = "9";

        if (relax == "b") {
          dayoffcolor = "red";
        } else if (relax == "s") {
          dayoffcolor = "green";
          //送出特休後，特休-1
          s_reduce--;
        } else if (relax == "t") {
          dayoffcolor = "blue";
        } else {
          dayoffcolor = "gray";
        }
        //呈現資料
        var myEvent = {
          title: optionname.text() + "_" + optiontime.text(),
          allDay: true,
          start: dateInput.val(),
          color: dayoffcolor,
        };

        //加入事件
        calendar.addEvent(myEvent);

        document
          .getElementById("eventFormButtonsure")
          //加入收合表單屬性
          .setAttribute("data-dismiss", "modal");
        //事件確定鍵，加入後 選單重置
        document.querySelector("#nameInputla").value = 0;
        document.querySelector("#eventTimeInputla").value = 0;
        document.querySelector("#relaxInputla").value = 0;
      }

      //刪除鍵
      //  function aClick() {}
      //  $("#eventFormButtonreremove").click(function () {
      //    alert("確認刪除嗎?");
      //    $("body").remove("click", "#monkey", aClick).find("#monkey").text("");
      //  });

      //月曆上資料，修改 刪除================================

      // 一天，上限畫假兩人

      // 一月，上限畫八天假
    });
});
