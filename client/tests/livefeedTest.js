// @flow

import * as React from 'react';
import { Component } from 'react-simplified';
import {LiveFeed, LiveFeedElement} from '../src/Components/staticComponents';
import { shallow, mount } from 'enzyme';
import { Nyhetssak, nyhetssakService } from '../src/services.js';

//jest.mock('../src/services.js');

describe('Livefeed tests', () => {
    const wrapper = shallow(<LiveFeed />);

    it('initially', () => {
        let instance = LiveFeed.instance();
        expect(typeof instance).toEqual('object');
        if (instance) expect(instance.saker).toEqual([]);
    });

    it('after load', () => {
        let tab: Nyhetssak[] = [new Nyhetssak(1, 'Overskrift', 'Innhold', '2019-10-11 02-20', 'bilde.jpg', 'Sport', false, 10, 1), new Nyhetssak(2, 'Overskrift2', 'Innhold2', '2019-10-11 02-20', 'bilde.jpg', 'Sport', false, 10, 2)]
        jest.spyOn(nyhetssakService, 'livefeed').mockResolvedValue(tab);
        wrapper.update()
        let instance = LiveFeed.instance();
        expect(typeof instance).toEqual('object');
        if (instance) {
            instance.forceUpdate();
            instance.saker = tab;
            expect(wrapper.debug()).toMatchSnapshot();
        };
    });
});