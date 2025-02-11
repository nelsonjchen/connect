/* eslint-env jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Thumbnails from './thumbnails';

const screenHeight = 1000;
const screenWidth = 1600;
const gutter = 20;
const percentToOffsetMock = jest.fn();
const getCurrentRouteMock = jest.fn();

const thumbnailBounds = {
  top: 100,
  bottom: screenHeight - (100 + 100), // top + height
  left: gutter,
  right: screenWidth - gutter,

  width: screenWidth - (gutter * 2),
  height: 100,
};

const heightWithBlackBorder = 120;

describe('timeline thumbnails', () => {
  beforeEach(() => {
    percentToOffsetMock.mockImplementation((percent) => Math.round(percent * 30000));
    getCurrentRouteMock.mockImplementation((offset) => {
      if (offset < 1600 || offset > 20000) {
        return null;
      }
      return {
        offset: 1600,
        segment_numbers: Array.from(Array(4).keys()),
        segment_offsets: Array.from(Array(4).keys()).map((i) => i * 60),
      };
    });
  });

  it('should check the segment for every image', () => {
    render(
      <Thumbnails
        thumbnail={thumbnailBounds}
        percentToOffset={percentToOffsetMock}
        getCurrentRoute={getCurrentRouteMock}
      />,
    );

    expect(percentToOffsetMock.mock.calls.length).toBe(10);
    expect(getCurrentRouteMock.mock.calls.length).toBe(10);
    const imageEntries = screen.getAllByRole('img');
    expect(imageEntries).toHaveLength(5);

    imageEntries.forEach((entry, i) => {
      expect([...entry.classList].indexOf('thumbnailImage')).toBeGreaterThan(-1);
      if (i === 0 || i === 4) {
        expect([...entry.classList].indexOf('blank')).toBeGreaterThan(-1);
      } else {
        const backgroundParts = entry.style.backgroundSize.split(' ');
        const height = Number(backgroundParts[1].replace('px', ''));
        expect(height).toBe(heightWithBlackBorder);
        // never stretch thumbnail images
        expect(backgroundParts[0]).toBe('auto');
      }
    });
  });

  it('doesn\'t render before bounds are set', () => {
    render(
      <Thumbnails
        thumbnail={{
          width: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        percentToOffset={percentToOffsetMock}
        getCurrentRoute={getCurrentRouteMock}
      />,
    );

    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('works when theres no blank at the end', () => {
    getCurrentRouteMock.mockImplementation((offset) => {
      if (offset < 1600) {
        return null;
      }
      return {
        offset: 1600,
        segment_numbers: Array.from(Array(4).keys()),
        segment_offsets: Array.from(Array(4).keys()).map((i) => i * 60),
      };
    });

    render(
      <Thumbnails
        thumbnail={thumbnailBounds}
        percentToOffset={percentToOffsetMock}
        getCurrentRoute={getCurrentRouteMock}
      />,
    );

    expect(percentToOffsetMock.mock.calls.length).toBe(10);
    expect(getCurrentRouteMock.mock.calls.length).toBe(10);
    const imageEntries = screen.getAllByRole('img');
    expect(imageEntries).toHaveLength(5);

    imageEntries.forEach((entry, i) => {
      expect([...entry.classList].indexOf('thumbnailImage')).toBeGreaterThan(-1);
      if (i === 0) {
        expect([...entry.classList].indexOf('blank')).toBeGreaterThan(-1);
      } else {
        const backgroundParts = entry.style.backgroundSize.split(' ');
        const height = Number(backgroundParts[1].replace('px', ''));
        expect(height).toBe(heightWithBlackBorder);

        // never stretch thumbnail images
        expect(backgroundParts[0]).toBe('auto');
      }
    });
  });

  it('works when its supermegaskinny', () => {
    render(
      <Thumbnails
        thumbnail={{
          width: 0,
          height: 100,
          left: 10,
          right: 10,
          top: 100,
          bottom: 100,
        }}
        percentToOffset={percentToOffsetMock}
        getCurrentRoute={getCurrentRouteMock}
      />,
    );

    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(percentToOffsetMock.mock.calls.length).toBe(0);
    expect(getCurrentRouteMock.mock.calls.length).toBe(0);
  });
});
