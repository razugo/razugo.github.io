# Overiew

I want to add some features to ./projects/poker_clicker/poker_clicker.html

# Requirements
1. Add an "Undo" button
    - if clicked it will undo the most recent action
    - this should be able to be clicked multiple times to undo multiple things
2. Update the hand combination
    - Always have the higher card listed first
    - For example JKo should be KJo
3. Persist data in local storage
    - Data should persist between page reloads
    - Store count data in local storage
4. Create count toggle button
    - this button should hide and unhide the counts of each cell
    - when toggled off, only the hand value should be shown
    - when toggled on, the count should replace the hand value 