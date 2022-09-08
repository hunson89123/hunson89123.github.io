//單張
function isSingle(selected, selectedH, selectN) {
  return selected.length == 1 && selected[0]!="";
}

//對子
function isPair(selected, selectedH, selectedN) {
  if (selected.length == 2) {
    console.log(selectedN[0]+"==?"+selectedN[1])
    return selectedN[0] == selectedN[1];
  }
  return false;
}

//順子
function isStraight(selected, selectedH,  selectedN) {
  if (selected.length == 5) {
    let valid = true;
    selectedN = selectedN.sort();
    for (let i = 0; i < 4; i++) {
      let current = selectedN[i];
      let next = selectedN[i+1];
      console.log(current+" "+next);
      if (current == 2 || current == 1 && selectN[0] == 10 || selectN[0] == 11) {
        current += 13;
      }
      if (next == 2 || next == 1 && selectN[0] == 10 || selectN[0] == 11) {
        next += 13;
      }
      if (current != next - 1) {
        valid = false;
        break;
      }

    }
    return valid;
  }
  return false;
}

//葫蘆
function isFullHouse(selected, selectedH,  selectedN) {
  if (selected.length == 5) {
    let valid = true;
    let flag = selectedN[2];
    if (selectedN[1] == flag) {
      if (selectedN[0] != selectedN[1]) {
        valid = false;
      }
      if (selectedN[3] != selectedN[4]) {
        valid = false;
      }
    } else if (selectedN[3] == flag) {
      if (selectedN[3] != selectedN[4]) {
        valid = false;
      }
      if (selectedN[0] != selectedN[1]) {
        valid = false;
      }
    } else
    valid = false;
    return valid;
  }
  return false;
}

//鐵支
function isFourOfaKind(selected, selectedH,  selectedN) {
  if (selected.length == 5) {
    let counter;
    for (let i = 0; i < selected.length; i++) {
      counter = 0;
      for (let j = 0; j < selected.length; j++)
        if (selectedN[j] == selectedN[i])
          counter++;
        if (counter >= 4)
          return true;
      }
    }
    return false;
  }

//同花順
function isFlush(selected, selectedH,  selectedN) {
  let valid = true;
  if (selected.length != 5) return false;
  else {
    if (isStraight(selected, selectedH, selectedN)) {
      for (let i = 0; i < 4; i++)
        if (selectedH[i] != selectedH[4]) {
          valid = false;
          break;
        }
      } else valid = false;
    }
    return valid;
  }