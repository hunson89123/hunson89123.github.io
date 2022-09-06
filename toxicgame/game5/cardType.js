//單張
function isSingle(selected, selectedH, selectN) {
  return selected.length == 1;
}

//對子
function isPair(selected, selectedH, selectedN) {
  if (selected.length == 2) {
    return selectedN.get(0).equals(selectedN.get(1));
  }
  return false;
}

//順子
function isStraight(selected, selectedH,  selectedN) {
  if (selected.length == 5) {
    boolean valid = true;
    for (int i = 0; i < 4; i++) {
      int current = selectedN.get(i);
      int next = selectedN.get(i + 1);

            // when the card is 'Ace' or 'Two', give it higher value according to the rule of the BigTwo game.
            if (current == 2 || current == 1) {
              current += 13;
            }
            if (next == 2 || next == 1) {
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
    boolean valid = true;
    int flag = selectedN.get(2);
        if (selectedN.get(1) == flag) {    // when the rank of center card is equal to that of the card on left.
          if (!selectedN.get(0).equals(selectedN.get(1))) {
            valid = false;
          }
          if (!selectedN.get(3).equals(selectedN.get(4))) {
            valid = false;
          }
        } else if (selectedN.get(3) == flag) {    // when the rank of center card is equal to that of the card on right.
          if (!selectedN.get(3).equals(selectedN.get(4))) {
            valid = false;
          }
          if (!selectedN.get(0).equals(selectedN.get(1))) {
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
    int counter;
    for (int i = 0; i < selected.length; i++) {
      counter = 0;
      for (int j = 0; j < selected.length; j++)
        if (selectedN.get(j).equals(selectedN.get(i)))
          counter++;
        if (counter >= 4)
          return true;
      }
    }
    return false;
  }

//同花順
function isFlush(selected, selectedH,  selectedN) {
  boolean valid = true;
  if (selected.length != 5) return false;
  else {
    if (isStraight(selected, selectedH, selectedN)) {
      for (int i = 0; i < 4; i++)
        if (!selectedH.get(i).equals(selectedH.get(4))) {
          valid = false;
          break;
        }
      } else valid = false;
    }
    return valid;
  }