const DataCtrl = (function () {
  // private func to create 4 digs
  const randomGenerator = (total) => {
    // private function to create arr
    const createArrNumbers = (start, total) => {
      let arrNew = [];
      for (let i = start; i < total + 1; i++) {
        arrNew.push(i);
      }
      return arrNew;
    };

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
  const gameInfo = { attempt: 0 };
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
    getGameInfo: function () {
      return gameInfo;
    },
  };
})();

const UIAnimations = (function () {
  const item = {};
  return {
    printName: function (playerName) {
      UICtrl.addRemoveHide("add", UICtrl.getSelectors().playerNameBlock);

      UICtrl.getSelectors().inputName.style.transition = "all 0.5s";
      UICtrl.getSelectors().inputName.style.opacity = "0";

      UICtrl.getSelectors().btnSendPlayerName.style.opacity = "0";
      UICtrl.getSelectors().containerBtnSendName.style.display = "none";

      UICtrl.getSelectors().playerName.style.opacity = "0";

      setTimeout(() => {
        UICtrl.addRemoveHide("remove", UICtrl.getSelectors().playerNameBlock);
      }, 300);

      setTimeout(() => {
        UICtrl.getSelectors().playerName.style.opacity = "1";
        UICtrl.getSelectors().playerName.innerHTML = `${playerName}<span>Vs</span>Rooster`;
      }, 800);
    },
    startGame: function () {
      let playerBlock = UICtrl.getSelectors().playerNumbersBlock;
      let hintsBlock = UICtrl.getSelectors().hintsBlock;
      let optionsBlock = UICtrl.getSelectors().optionsBlock;

      UICtrl.addRemoveHide("add", playerBlock);
      UICtrl.addRemoveHide("add", hintsBlock);
      UICtrl.addRemoveHide("add", optionsBlock);

      playerBlock.style.transition = "all 0.5s";
      playerBlock.style.opacity = "0";

      hintsBlock.style.transition = "all 0.5s";
      hintsBlock.style.opacity = "0";

      optionsBlock.style.transition = "all 0.5s";
      optionsBlock.style.opacity = "0";

      setTimeout(() => {
        UICtrl.addRemoveHide("remove", playerBlock);
        UICtrl.addRemoveHide("remove", hintsBlock);
        UICtrl.addRemoveHide("remove", optionsBlock);
      }, 500);

      setTimeout(() => {
        playerBlock.style.opacity = "1";

        hintsBlock.style.opacity = "1";

        optionsBlock.style.opacity = "1";
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
          // input focus on bulls
          document.querySelectorAll(UICtrl.getClasses().playerNumber)[
            i
          ].style.backgroundColor = "yellow";
          document.querySelectorAll(UICtrl.getClasses().playerNumber)[
            i
          ].style.color = "black";

          bulls.push(x);
          // find cows(value )
        } else if (x === arrPlayerMachine[i]) {
          cows.push(x);
        }
      }
      // filter duplicates is a bull and not a cow
      cows = cows.filter((value) => !bulls.includes(value));
    });

    return { bulls: bulls.length, cows: cows.length };
  };
  return {
    getPlayerName: function (e) {
      e.preventDefault();
      // set player name in obj
      DataCtrl.getPlayer01Data().firstName = UICtrl.getSelectors().inputName.value;
      // send to ui animation Ctrl
      localStorage.setItem(
        "player01",
        JSON.stringify(DataCtrl.getPlayer01Data())
      );
      setTimeout(() => {
        UIAnimations.printName(DataCtrl.getPlayer01Data().firstName);

        UIAnimations.startGame();
      }, 300);

      UICtrl.letsPlay();
    },
    getPlayerNumbers: function (e) {
      e.preventDefault();
      // console.log(DataCtrl.getPlayer01Data().numbers);
      let playerNumberArr = DataCtrl.getPlayer01Data().numbers;

      if (playerNumberArr.length !== 0) playerNumberArr = [];

      // if (playerNumberArr.length <= 3) {
      playerNumberArr = [];

      UICtrl.getInputNodes().forEach((x) => {
        playerNumberArr.push(x.value);
      });

      // }

      return playerNumberArr;
    },
    playGame: function (e) {
      e.preventDefault();

      UICtrl.letsPlay();

      let playerNumbers = ItemCtrl.getPlayerNumbers(e);

      if ([...new Set(playerNumbers)].length !== 4) {
        return UICtrl.setPlayerErrorMsg(
          UICtrl.getSelectors().playerNumbersMsg,
          "You need unique numbers!",
          "red",
          "white"
        );
      }

      App.gameInfo().attempt++;

      UICtrl.setPlayerErrorMsg(
        UICtrl.getSelectors().playerNumbersMsg,
        "Insert 4 unique numbers! Good Luck!",
        "white",
        "#a1483e"
      );

      let machineNumbers = DataCtrl.getPlayerMachineData().numbers;

      let objHints = compare(playerNumbers, machineNumbers);

      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().printHintsMsg);

      // check attempts
      if (App.gameInfo().attempt === 10) {
        UICtrl.playHen();

        UICtrl.getSelectors().btnSendPlayerNumbers.disabled = true;

        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You lose!!! AHHH AHH `);
      }
      // check wins
      if (objHints.bulls === 4) {
        UICtrl.playHen();
        UICtrl.getSelectors().btnSendPlayerNumbers.disabled = true;

        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `Great!!!! You win!!!<br> With <span>${
          App.gameInfo().attempt
        }</span><br> attempts! ${UICtrl.getNewGameBtn()}`);
      }

      //  bulls msgs
      if (objHints.bulls === 1) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You have <span>${objHints.bulls} Bull</span> and <br><span>${objHints.cows} Cows!</span> Pretty weak...`);
      }
      if (objHints.bulls === 2) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You have <span>${objHints.bulls} Bulls</span> and <br><span>${objHints.cows} Cows!</span>`);
      }
      if (objHints.bulls === 3) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You have <span>${objHints.bulls} Bulls!!!</span> <br>Great! Really close!!!`);
      }
      // Cows msg
      if (objHints.bulls === 0 && objHints.cows === 0) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You ain't got no matches!<br> You are really far!!!`);
      }
      if (objHints.cows === 1) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You have <span>${objHints.bulls} Bulls</span> and<br> <span>${objHints.cows} Cow...</span> Such a disaster...`);
      }
      if (objHints.cows === 2) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You have <span>${objHints.bulls} Bulls</span> and<br> <span>${objHints.cows} Cows...</span> Such a disaster...`);
      }
      if (objHints.cows === 3) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You have <span>${objHints.bulls} Bulls</span> and<br> <span>${objHints.cows} Cows...</span>Not so bad...`);
      }
      if (objHints.cows === 4) {
        return (UICtrl.getSelectors().printHintsMsg.innerHTML = `You have <span>${objHints.cows} Cows!</span>Just around with them!`);
      }
    },
    plusOne: function (e, index) {
      // get input nodes
      // select node with index and increment it

      // CHECK VALUE AND STOP INCREMENT
      if (UICtrl.getInputNodes()[index].value > 8) {
        return UICtrl.getInputNodes()[index].value;
      }
      UICtrl.getInputNodes()[index].value++;
      UICtrl.inputChecker(UICtrl.getInputNodes()[index]);
    },

    minusOne: function (e, index) {
      if (UICtrl.getInputNodes()[index].value < 1) {
        return UICtrl.getInputNodes()[index].value;
      }

      UICtrl.getInputNodes()[index].value--;
      UICtrl.inputChecker(UICtrl.getInputNodes()[index]);
    },
  };
})();

const UICtrl = (function () {
  const UIClasses = {
    container: ".container",
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

    optionsBlock: ".options__block",

    gameArea: ".game__area",
    henImg: ".hen__img",

    // increment mobile
    btnNumMinus: ".btn-number-minus",
    btnNumPlus: ".btn-number-plus",
  };
  const UISelectors = {
    container: document.querySelector(UIClasses.container),
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

    optionsBlock: document.querySelector(UIClasses.optionsBlock),

    gameArea: document.querySelector(UIClasses.gameArea),

    henImg: document.querySelector(UIClasses.henImg),
  };

  return {
    getInputNodes: function () {
      let inputNodes = UICtrl.getSelectors().formPlayerNumbers.querySelectorAll(
        UICtrl.getClasses().playerNumber
      );
      return inputNodes;
    },
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
        // disable button

        UICtrl.getSelectors().btnSendPlayerNumbers.disabled = true;

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
        // re enable button
        UICtrl.getSelectors().btnSendPlayerNumbers.disabled = false;
        UICtrl.setPlayerErrorMsg(
          UICtrl.getSelectors().playerNumbersMsg,
          "Insert 4 unique numbers! Good Luck!",
          "white",
          "#a1483e"
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
        `Such a quitter!!!<br>The code is:<br><span>${
          DataCtrl.getPlayerMachineData().numbers
        }</span>`,
        "",
        ""
      );
    },
    newGame: function (e) {
      UIAnimations.printName();
      UIAnimations.startGame();
      setTimeout(() => {
        location.reload();
      }, 500);
    },
    getNewGameBtn: function () {
      return `<br><button class="btn-new-game-hints" onclick="location.reload()">Play another game!</button>`;
    },
    // set game area height
    setGameAreaHeight: function () {
      if (window.innerHeight < 850) {
        UISelectors.printHintsMsg.style.width = "310px";
        UISelectors.printHintsMsg.style.clipPath =
          "polygon(10% 0, 100% 0%, 100% 75%, 10% 74%, 10% 49%, 0 35%, 10% 23%)";
        // remove margin hen
        return (UISelectors.henImg.style.marginTop = "0px");
      }
    },
    setContainerWidth: function () {
      if (window.innerWidth < 960) {
        return (UISelectors.container.style.width = `${window.innerWidth}px`);
      }
    },
  };
})();

const App = (function (DataCtrl, UIAnimations, ItemCtrl, UICtrl) {
  const UISelectors = UICtrl.getSelectors();
  const gameInfo = DataCtrl.getGameInfo();

  // set width
  UICtrl.setContainerWidth();

  // SET GAME AREA
  UICtrl.setGameAreaHeight();

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
      .forEach((element, index) => {
        element.addEventListener("input", function (e) {
          e.preventDefault();
          // input checker
          UICtrl.inputChecker(e.target);
        });
      });

    // add event L to mobile increment
    document
      .querySelectorAll(UICtrl.getClasses().btnNumMinus)
      .forEach((x, index) => {
        x.addEventListener("click", function (e) {
          e.preventDefault();
          ItemCtrl.minusOne(e, index);
        });
      });

    document
      .querySelectorAll(UICtrl.getClasses().btnNumPlus)
      .forEach((x, index) => {
        x.addEventListener("click", function (e) {
          e.preventDefault();
          ItemCtrl.plusOne(e, index);
        });
      });
  };

  const startUpCheck = function () {
    if (JSON.parse(localStorage.getItem("player01")) === null) {
      UISelectors.playerNameBlock.classList.remove("hide");
    } else {
      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().playerNumbersBlock);
      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().hintsBlock);
      UICtrl.addRemoveHide("remove", UICtrl.getSelectors().optionsBlock);
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
    gameInfo: () => gameInfo,
  };
})(DataCtrl, UIAnimations, ItemCtrl, UICtrl);

App.init();
