let attempt = 0;

const DataCtrl = (function () {
  // private function to create arr
  const createArrNumbers = (start, total) => {
    let arrNew = [];
    for (let i = start; i < total + 1; i++) {
      arrNew.push(i);
    }
    return arrNew;
  };
  // private func to create 4 digs
  const randomGenerator = (total) => {
    let number = "";
    let newNumbers = "";
    let arrAllNumbers = createArrNumbers(0, 9);

    for (let i = 0; i < total; i++) {
      number = arrAllNumbers[Math.floor(Math.random() * arrAllNumbers.length)];
      newNumbers += number;
      arrAllNumbers.splice(arrAllNumbers.indexOf(number), 1);
    }

    return newNumbers;
  };
  // attempt counter
  const attempt = { attempt: 0 };
  // players
  const player01 = {
    firstName: "",
    // numbers: [],
    numbers: [],
    history: {},
  };
  const playerMachine = {
    firstName: "HAL 9000",
    // generates the array
    // numbers: ["1", "2", "3", "4"],
    numbers: [],
    history: {},
  };

  return {
    getPlayer01Data: function () {
      return player01;
    },
    getPlayerMachineData: function () {
      if (playerMachine.numbers.length === 0) {
        // console.log("generate", playerMachine.numbers.length);
        playerMachine.numbers = randomGenerator(4);
        return playerMachine;
      } else if (playerMachine.numbers.length === 4) {
        return playerMachine;
      }
    },
    getAttempt: function () {
      return attempt.attempt;
    },
  };
})();

const UIAnimations = (function () {
  const item = {};
  return {
    printName: function (playerName) {
      UICtrl.getSelectors().playerNameBlock.classList.remove("hide");

      UICtrl.getSelectors().inputName.style.transition = "all 0.5s";
      UICtrl.getSelectors().inputName.style.opacity = "0";
      UICtrl.getSelectors().inputName.style.width = "0px";

      UICtrl.getSelectors().btnSendPlayerName.style.opacity = "0";
      UICtrl.getSelectors().containerBtnSendName.style.display = "none";

      UICtrl.getSelectors().playerName.style.opacity = "0";
      UICtrl.getSelectors().playerName.style.width = "0px";
      setTimeout(() => {
        UICtrl.getSelectors().playerName.style.opacity = "1";
        UICtrl.getSelectors().playerName.style.width = "400px";
        UICtrl.getSelectors().playerName.innerHTML = `${playerName} <span>Vs</span> The Hen`;
      }, 1000);
    },
  };
})();

const ItemCtrl = (function () {
  const compare = (arrPlayer, arrPlayerMachine) => {
    let cows = [];
    let bulls = [];

    // map array player
    arrPlayer.forEach((x, index) => {
      for (let i = 0; i < arrPlayerMachine.length; i++) {
        // find bulls (value + position)
        if (x === arrPlayerMachine[i] && i === index) {
          bulls.push(x);
          // find cows(value )
        } else if (x === arrPlayerMachine[i]) {
          cows.push(x);
        }
      }
      // filter duplicates is a bull and not a cow
      cows = cows.filter((value) => !bulls.includes(value));
      // make unique values
      // cows = [...new Set(cows)];
    });

    return { bulls: bulls.length, cows: cows.length };
  };
  return {
    getPlayerName: function (e) {
      e.preventDefault();
      // set player name in obj
      DataCtrl.getPlayer01Data().firstName = UICtrl.getSelectors().inputName.value;
      // send to ui anim
      UIAnimations.printName(DataCtrl.getPlayer01Data().firstName);
      localStorage.setItem(
        "player01",
        JSON.stringify(DataCtrl.getPlayer01Data())
      );
      UICtrl.letsPlay();
      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().playerNumbersBlock);
      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().hintsBlock);

      // UICtrl.getSelectors().btnSendPlayerNumbers.disabled = UICtrl.playerHasName();
    },
    getPlayerNumbers: function (e) {
      e.preventDefault();
      // console.log(DataCtrl.getPlayer01Data().numbers);
      let playerNumberArr = DataCtrl.getPlayer01Data().numbers;

      if (playerNumberArr.length !== 0) playerNumberArr = [];

      // if (playerNumberArr.length <= 3) {
      playerNumberArr = [];
      let numberNodes = UICtrl.getSelectors().formPlayerNumbers.querySelectorAll(
        UICtrl.getClasses().playerNumber
      );
      numberNodes.forEach((x) => {
        playerNumberArr.push(x.value);
      });

      // }

      return playerNumberArr;
    },
    playGame: function (e) {
      e.preventDefault();

      UICtrl.letsPlay(); // let attempt = DataCtrl.getAttempt();

      let playerNumbers = ItemCtrl.getPlayerNumbers(e);

      if ([...new Set(playerNumbers)].length !== 4) {
        // UICtrl.getSelectors().playerNumbersMsg.style.color = "white";
        // UICtrl.getSelectors().playerNumbersMsg.style.backgroundColor = "red";
        return UICtrl.setPlayerErrorMsg(
          UICtrl.getSelectors().playerNumbersMsg,
          "You need unique numbers!",
          "red",
          "white"
        );
      }
      attempt++;

      UICtrl.setPlayerErrorMsg(
        UICtrl.getSelectors().playerNumbersMsg,
        "Insert 4 unique numbers! Good Luck!",
        "white",
        "red"
      );

      let machineNumbers = DataCtrl.getPlayerMachineData().numbers;

      let objHints = compare(playerNumbers, machineNumbers);

      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().printHintsMsg);

      UICtrl.playHen();

      // bulls msg
      if (objHints.bulls === 0 && objHints.cows === 0) {
        UICtrl.getSelectors().printHintsMsg.innerHTML = `You ain't got no match! You are really far!!!`;
      }
      if (objHints.bulls === 1) {
        UICtrl.getSelectors().printHintsMsg.innerHTML = `You have ${objHints.bulls} Bulls and ${objHints.cows} Cows! Pretty weak...`;
      }
      if (objHints.bulls <= 2) {
        UICtrl.getSelectors().printHintsMsg.innerHTML = `You have ${objHints.bulls} Bulls and ${objHints.cows} Cows!`;
      }
      if (objHints.bulls === 3) {
        UICtrl.getSelectors().printHintsMsg.innerHTML = `You have ${objHints.bulls} Bulls!!! Great! Really close!!!`;
      }
      // // bulls msg
      if (objHints.bulls === 0 && objHints.cows <= 2) {
        UICtrl.getSelectors().printHintsMsg.innerHTML = `You have ${objHints.bulls} Bulls and ${objHints.cows} Cows... Such a disaster...`;
      }

      // WINS
      if (objHints.bulls === 4) {
        UICtrl.getSelectors().printHintsMsg.innerHTML = `Great!!!! You win!!! With ${attempt} attempts! ${UICtrl.getNewGameBtn()}`;
      }

      // check attempts

      // if (attempt === 10) {
      //   UICtrl.getSelectors().printHintsMsg.innerHTML = `You lose!!! AHHH AHH `;
      // }

      // console.log("machineNumbers", machineNumbers);
    },
  };
})();

const UICtrl = (function () {
  const UIClasses = {
    inputName: ".input__name",
    playerName: ".player__name",
    playerNameBlock: ".player__name__block",
    containerBtnSendName: ".container__btn__send__name",
    playerNumbersMsg: ".player__numbers__msg",

    playerNumbersBlock: ".player__numbers__block",
    formPlayerNumbers: ".player__numbers__form",
    playerNumber: ".player__number",

    btnSendPlayerNumbers: ".btn-send-player-numbers",
    btnSendPlayerName: ".btn-send-name",

    hintsBlock: ".hints__block",
    printHints: ".print__hints",
    printHintsMsg: ".hints__msg",

    showCode: ".show__code",
    btnShowCode: ".btn-show-code",

    deleteUserInfo: ".delete__user__info",
    btnDeleteUser: ".btn-delete-user-info",

    btnNewGame: ".btn-new-game",
  };
  const UISelectors = {
    inputName: document.querySelector(UIClasses.inputName),
    playerName: document.querySelector(UIClasses.playerName),
    containerBtnSendName: document.querySelector(
      UIClasses.containerBtnSendName
    ),
    playerNumbersBlock: document.querySelector(UIClasses.playerNumbersBlock),
    playerNumbersMsg: document.querySelector(UIClasses.playerNumbersMsg),
    formPlayerNumbers: document.querySelector(UIClasses.formPlayerNumbers),
    playerNameBlock: document.querySelector(UIClasses.playerNameBlock),
    hintsBlock: document.querySelector(UIClasses.hintsBlock),
    printHints: document.querySelector(UIClasses.printHints),
    printHintsMsg: document.querySelector(UIClasses.printHintsMsg),
    btnSendPlayerNumbers: document.querySelector(
      UIClasses.btnSendPlayerNumbers
    ),
    btnSendPlayerName: document.querySelector(UIClasses.btnSendPlayerName),

    btnShowCode: document.querySelector(UIClasses.btnShowCode),
    btnDeleteUser: document.querySelector(UIClasses.btnDeleteUser),

    btnNewGame: document.querySelector(UIClasses.btnNewGame),
  };

  return {
    getClasses: function () {
      return UIClasses;
    },
    getSelectors: function () {
      return UISelectors;
    },
    playerHasName: function () {
      console.log(JSON.parse(localStorage.getItem("player01")));
      if (JSON.parse(localStorage.getItem("player01")) !== null) {
        return false;
      } else {
        return true;
      }
    },
    addRemoveHide: function (toDo, element) {
      if (toDo === "remove") {
        return element.classList.remove("hide");
      }
      return element.classList.add("hide");
    },
    setPlayerErrorMsg: function (target, msg, colorBack, colorText) {
      target.style.color = colorText;
      target.style.backgroundColor = colorBack;
      return (target.innerHTML = `${msg}`);
    },
    inputChecker: function (target) {
      var reg = /^\d+$/;

      if (!reg.test(target.value) || target.value.length !== 1) {
        UICtrl.setPlayerErrorMsg(
          UICtrl.getSelectors().playerNumbersMsg,
          "Error! Just Numbers between 0-9!",
          "red",
          "white"
        );
        target.style.backgroundColor = "black";
        return (target.style.color = "white");
      }

      if (reg.test(target.value) && target.value.length === 1) {
        UICtrl.setPlayerErrorMsg(
          UICtrl.getSelectors().playerNumbersMsg,
          "Insert 4 unique numbers! Good Luck!",
          "white",
          "red"
        );
        target.style.color = "#a1483e";
        return (target.style.backgroundColor = "white");
      }
    },
    playHen: function () {
      var audio = document.getElementById("hen");
      audio.play();
    },
    letsPlay: function () {
      location.hash = "#playGame";
    },
    resetUserInfo: function () {
      location.reload();
      localStorage.removeItem("player01");
    },
    showCode: function () {
      UICtrl.setPlayerErrorMsg(
        UICtrl.getSelectors().printHintsMsg,
        `The code is: ${DataCtrl.getPlayerMachineData().numbers}`,
        "",
        ""
      );
    },
    newGame: function () {
      location.reload();
    },
    getNewGameBtn: function () {
      return `<br><button class="btn-new-game-hints" onclick="location.reload()">Play another game!</button>`;
    },
  };
})();

const App = (function (DataCtrl, UIAnimations, ItemCtrl, UICtrl) {
  const UISelectors = UICtrl.getSelectors();
  const loadEventListeners = function () {
    UISelectors.btnSendPlayerNumbers.addEventListener(
      "click",
      ItemCtrl.playGame
    );
    UISelectors.btnSendPlayerName.addEventListener(
      "click",
      ItemCtrl.getPlayerName
    );

    UISelectors.btnShowCode.addEventListener("click", UICtrl.showCode);
    UISelectors.btnNewGame.addEventListener("click", UICtrl.newGame);
    UISelectors.btnDeleteUser.addEventListener("click", UICtrl.resetUserInfo);

    // INPUT CHECKEr

    document
      .querySelectorAll(UICtrl.getClasses().playerNumber)
      .forEach((element) => {
        element.addEventListener("input", function (e) {
          e.preventDefault();
          // input checker
          UICtrl.inputChecker(e.target);
        });
      });
  };

  const startUpCheck = function () {
    // localStorage.getItem("player01").firstName;
    // console.log(JSON.parse(localStorage.getItem("player01")));
    if (JSON.parse(localStorage.getItem("player01")) === null) {
      UISelectors.playerNameBlock.classList.remove("hide");
      // UISelectors.btnSendPlayerNumbers.disabled = UICtrl.playerHasName();
    } else {
      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().playerNumbersBlock);
      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().hintsBlock);
      UIAnimations.printName(
        JSON.parse(localStorage.getItem("player01")).firstName
      );
    }
  };

  return {
    init: function () {
      loadEventListeners();
      startUpCheck();
    },
  };
})(DataCtrl, UIAnimations, ItemCtrl, UICtrl);

App.init();