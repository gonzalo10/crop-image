import React, { useRef } from 'react';

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
	DragBarOrdN,
	DragBarOrdE,
	DragBarOrdS,
	DragBarOrdW,
} from './styles';
import { getClientPos, convertToPixelCrop } from './utils';

export const CreateCropSelection = ({
	props,
	getCropStyle,
	onCropAreaMouseDown,
	handleChangeSelection,
	getElementOffset,
	mediaDimensions,
}) => {
	const refContainer = useRef(null);
	const { disabled, locked, ruleOfThirds } = props;
	const style = getCropStyle();

	onCropAreaMouseDown = e => {
		const { crop, disabled } = props;
		const { width, height } = mediaDimensions;
		const pixelCrop = convertToPixelCrop(crop, width, height);

		if (disabled) {
			return;
		}
		e.preventDefault(); // Stop drag selection.

		const clientPos = getClientPos(e);

		const { ord } = e.target.dataset;
		const xInversed = ord === 'nw' || ord === 'w' || ord === 'sw';
		const yInversed = ord === 'nw' || ord === 'n' || ord === 'ne';

		let cropOffset;

		if (pixelCrop.aspect) {
			cropOffset = getElementOffset(refContainer);
		}

		const evData = {
			clientStartX: clientPos.x,
			clientStartY: clientPos.y,
			cropStartWidth: pixelCrop.width,
			cropStartHeight: pixelCrop.height,
			cropStartX: xInversed ? pixelCrop.x + pixelCrop.width : pixelCrop.x,
			cropStartY: yInversed ? pixelCrop.y + pixelCrop.height : pixelCrop.y,
			xInversed,
			yInversed,
			xCrossOver: xInversed,
			yCrossOver: yInversed,
			startXCrossOver: xInversed,
			startYCrossOver: yInversed,
			isResize: e.target.dataset.ord,
			ord,
			cropOffset,
		};

		handleChangeSelection(evData);
	};

	return (
		<CropSelectionWrapper
			ref={refContainer}
			style={style}
			onMouseDown={onCropAreaMouseDown}
			onTouchStart={onCropAreaMouseDown}
			tabIndex='0'>
			{!disabled && !locked && (
				<div>
					<DragBarOrdN data-ord='n' />
					<DragBarOrdE data-ord='e' />
					<DragBarOrdS data-ord='s' />
					<DragBarOrdW data-ord='w' />

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
};
