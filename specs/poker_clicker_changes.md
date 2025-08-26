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
5. Update the default color of cells
    - Cells should have one of 3 colors: white (#FFFFFF), dark gray (#A9A9A9) or light gray (#D8D8D8)
    - Off suit cells should be white
    - Pair cells should be dark gray
    - suited cells should be light gray
    - Any red due to counts should override this base color
6. Make clicking on a cell easier
    - Sometimes clicking a cell on mobile isnt easy and you can fat finger an unintended cell
    - I want a user experience similar to the mac os dock where when hovering over an option it increases in size
    - Instead I want the cell to increase in size when i click but do not release
    - Then when moving my finger (still down clicked) the cell selection also changes, changing which cell has the increase in size
    - For mobile i want to the cell to move up and expand more so I can see it over my finger. Do not do this for desktop.
    - When selecting cells in the top row, make it so the cell goes over the header. currently when selected, the cell gets cut off by the header
    - Make the cell border darker #696969
