# Overiew

I want to add some features to ./projects/poker_clicker/poker_clicker.html

Do not delete any files in ./specs including this file

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
7. Integrate ./specs/poker_luck_analyzer.html with poker_clicker.html
    - Now that we have a track record of what hands are being dealt, I want to add some analysis to see if i am "low roll" "expected" or "high roll"
    - Reference poker_luck_analyzer
    - Instead of a text input like the poker_luck_analyzer does, use the chart's selection as input to the statistics
    - Copy over the statistical logic
    - Display "low roll" "expected or "high roll"
    - Copy over the display of the stats below the result
    - Use ./specs/image_2.png and ./specs/image_3.png as reference
    - Add another toggle button that shows hand strength. When a user presses the same toggle button it should go back to showing the hand names
    - Update the hand strengths to use the strengths outlined in ./specs/image_4.png which uses a scale from 0-100 to asses hand strength
    - Update the strength logic to take into account the different number of hand combinations 12 for offsuit, 6 for pairs, 4 for suited
    - Make the max size for the body be the maximum size of the grid so that the analysis isnt larger than the grid
    - Center the whole app
    - Use ./specs/image_5.png as reference
    - When loading the app, the top portion of he grid is not visible, make sure the entire grid is on the page and visible
    - Remove the Hands Analysized statistic as its already visible at the top as "Total: X"
    - Ensure that hand strength calculation is using the distribution of cards combinations 12 for offsuit, 6 for pairs, 4 for suited in its statistical calculations