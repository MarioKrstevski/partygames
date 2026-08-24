import React from 'react';
import { createBoard } from '@wixc3/react-board';
import Dice from '../../../app/diceroll/play/Dice';

export default createBoard({
    name: 'Dice',
    Board: () => <Dice value={4} />,
    isSnippet: true,
});