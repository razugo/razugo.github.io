# Overiew

I want to add some features to ./projects/poker_clicker/poker_clicker.html

Do not delete any files in ./specs including this file

# Requirements
1. Move Toggle buttons to below the chart
    - for smaller windows the buttons seem to be colliding in the header
    - move the toggle counts and toggle strength buttons to below the chart but above the notes
2. Update low roll vs high roll
    - hand strength now is 0 being strongest, 100 being weakest
    - therefor high roll is closer to 0 and low roll is closer 100
    - flip them
3. Undo reset buttons
    - make the Undo and Reset buttons go to the right
    - The header should be total, to the left. and undo and reset to the right
4. Fix scaling issue
    - Use ./specs/scaling_bug.png for reference
    - On mobile, when scrolling, the page seems to shrink, leading to a smaller chart and more cramped text
    - fix this bug so scrolling doesnt change any of the formatting
    - keep margin at the top of the header
    - make sure the entire grid is visible at all sizes