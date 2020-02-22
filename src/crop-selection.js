import React from 'react';

import {
	NorthPoint,
	NorthWestPoint,
	WestPoint,
	NorthEastPoint,
	EastPoint,
	SouthEastPoint,
	SouthPoint,
	SouthWestPoint,
	CropSelectionWrapper,
} from './styles';

export function createCropSelection(
	props,
	getCropStyle,
	cropSelectRef,
	onCropAreaMouseDown
) {
	const { disabled, locked, ruleOfThirds } = props;
	const style = getCropStyle();

	return (
		<CropSelectionWrapper
			ref={r => (cropSelectRef = r)}
			style={style}
			onMouseDown={onCropAreaMouseDown}
			onTouchStart={onCropAreaMouseDown}
			tabIndex='0'>
			{!disabled && !locked && (
				<div>
					<div className='ReactCrop__drag-bar ord-n' data-ord='n' />
					<div className='ReactCrop__drag-bar ord-e' data-ord='e' />
					<div className='ReactCrop__drag-bar ord-s' data-ord='s' />
					<div className='ReactCrop__drag-bar ord-w' data-ord='w' />

					<NorthWestPoint data-ord='nw' />
					<NorthPoint data-ord='n' />
					<NorthEastPoint data-ord='ne' />
					<EastPoint data-ord='e' />
					<SouthEastPoint data-ord='se' />
					<SouthPoint data-ord='s' />
					<SouthWestPoint data-ord='sw' />
					<WestPoint data-ord='w' />
				</div>
			)}
			{ruleOfThirds && (
				<React.Fragment>
					<div className='ReactCrop__rule-of-thirds-hz' />
					<div className='ReactCrop__rule-of-thirds-vt' />
				</React.Fragment>
			)}
		</CropSelectionWrapper>
	);
}
