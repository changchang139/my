$(function () {
  // initialize the external events----------------------------------------------
  function ini_events(ele) {
    ele.each(function () {
      var eventObject = {
        title: $.trim($(this).text()), // use the element's text as the event title
      };

      // store the Event Object in the DOM element so we can get to it later
      $(this).data("eventObject", eventObject);

      // make the event 拖動 using jQuery UI
      // $(this).draggable({
      //   zIndex: 1070,
      //   revert: true, // will cause the event to go back to its
      //   revertDuration: 0, //  original position after the drag
      // });
    });
  }

  ini_events($("#external-events div.external-event"));

  //  initialize the calendar------------------------------------------------------------
  //Date for the calendar events (dummy data)
  // var date = new Date();
  // var d = date.getDate(),
  //   m = date.getMonth(),
  //   y = date.getFullYear();

  // var Calendar = FullCalendar.Calendar;
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
    height: 530,

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

    dateClick: function (data) {
      // $("#eventFormButtonsure").data("key", data.id);//事件確認按鈕，綁定事件ID
      // $("#eventFormButtonreremove").data("key", data.id);//事件刪除按鈕，綁定事件ID
      $("#dateInput").val(moment(data.date).format("YYYY-MM-DD")); //事件日期，預設填入被點選的日期，不得修改
      // $("#nameInput").val(data.eventItem).trigger("change");//事件類型，下拉選單，選單內容為：花花、泡泡、毛毛
      // $("#eventTimeInput").val(data.eventItem).trigger("change");//事件類型，下拉選單，選單內容為：早班、晚班
      // $("#relaxInput").val(data.eventItem).trigger("change");//事件類型，下拉選單，選單內容為：基本假、特休、事假、其他
      // $("#eventFormModalTitle").text("");//修改modal標題名稱
      // $("#eventFormButtonreremove").show();//顯示刪除按鈕
      if (addevenDayForTwo(data)) {
        //顯示編輯畫面事件
        $("#eventFormModal").modal("show"); //顯示編輯視窗，供使用者編輯
      }
    },
  });

  // 一天，畫假上限兩人===============================

  function addevenDayForTwo(data) {
    // console.log(data);
    var perDay = data.dayEl.innerText; //捕捉單日裡的內文
    var perDayCount = perDay.split("\n"); //用斷行切割
    // console.log(perDayCount.length);
    if (perDayCount.length == 3) {
      alert("單日僅能畫休兩位");
      return false;
    } else {
      return true; //回到顯示視窗
    }
  }

  //取消按鍵，返回初始值====================================
  document
    .querySelector("#eventFormButtonCancel")
    .addEventListener("click", function () {
      document.getElementById("eventTimeInputla").value = 0;
      document.getElementById("relaxInputla").value = 0;
    });

  //x按鍵，返回初始值======================================
  document.querySelector("#inputxxx").addEventListener("click", function (e) {
    document.querySelector("#eventTimeInputla").value = 0;
    document.querySelector("#relaxInputla").value = 0;
  });

  // 確定按鍵，資料呈現==================================
  document
    .getElementById("eventFormButtonsure")
    .addEventListener("click", function () {
      var dateInput = $("#dateInput");
      var optiontime = $("#eventTimeInputla option:selected");
      var optionrelax = $("#relaxInputla option:selected");
      // alert(optionname.text());
      // console.log(dateInput.val())
      // console.log(optionname.val())

      //選單正確填入，判斷===============
      var errorMsg = "";
      var errorflag = false;
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
        //顏色分假別=================
        var dayoffcolor;
        var relax = optionrelax.val();
        var reduce = document.getElementById(relax + "_reduce");
        if (relax == "b") {
          dayoffcolor = "red";
          reduce.innerHTML--;
        } else if (relax == "o") {
          dayoffcolor = "gray";
        } else if (relax == "t") {
          dayoffcolor = "blue";
          reduce.innerHTML++;
        } else if (relax == "s") {
          dayoffcolor = "green";
          //送出特休後，特休-1
          reduce.innerHTML--;
        }
        //呈現資料===================
        var myEvent = {
          title: nameInputla.innerHTML + "_" + optiontime.text(),
          allDay: true,
          start: dateInput.val(),
          color: dayoffcolor,
        };

        //加入事件====================
        calendar.addEvent(myEvent);

        document
          .getElementById("eventFormButtonsure")
          //加入收合表單屬性
          .setAttribute("data-dismiss", "modal");
        //事件確定鍵，加入後 選單重置
        document.querySelector("#eventTimeInputla").value = 0;
        document.querySelector("#relaxInputla").value = 0;
      }
    });

  //特休，判斷==========================================
  document
    .getElementById("relaxInputla")
    .addEventListener("change", function () {
      var relax = this.value;
      var reduce = document.getElementById(relax + "_reduce");
      if (relax == "b") {
        if (reduce.innerHTML == 0) {
          alert("基本假已使用完，請選擇其他假別");
          document.querySelector("#relaxInputla").value = 0;
        }
      } else if (relax == "s") {
        if (reduce.innerHTML == 0) {
          alert("特休已使用完，請選擇其他假別");
          document.querySelector("#relaxInputla").value = 0;
        }
      } else if (relax == "t") {
        if (reduce.innerHTML >= 14) {
          alert("當年度特休已使用完，請選擇其他假別");
          document.querySelector("#relaxInputla").value = 0;
        }
      }
    });
  //月曆上資料，修改 刪除================================

  // 一月，上限畫八天假

  //(最後送出)抓所有資料 送出======================================
  var eventa = calendar.getEvents();
  console.log(eventa);

  eventa.forEach(function (element) {
    var evId = element["_def"]["publicId"];
    var even = calendar.getEventById(evId);
    console.log(even.title);
    console.log(even.start.toISOString());
  });
  calendar.render();
});
