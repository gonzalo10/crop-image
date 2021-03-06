import ReactDOM from 'react-dom';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ReactCrop from './image-crop';
import './image-crop.css';

const AppWrapper = styled.div`
	font-family: sans-serif;
	text-align: center;
`;

class App extends PureComponent {
	state = {
		src: null,
	};

	onSelectFile = e => {
		if (e.target.files && e.target.files.length > 0) {
			const reader = new FileReader();
			reader.addEventListener('load', () =>
				this.setState({ src: reader.result })
			);
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	// If you setState the crop in here you should return false.
	onImageLoaded = e => (this.imageRef = e.target);

	onCropComplete = crop => this.makeClientCrop(crop);

	onCropChange = (crop, percentCrop) => {
		this.setState({ crop });
	};

	async makeClientCrop(crop) {
		if (this.imageRef && crop.width && crop.height) {
			const croppedImageUrl = await this.getCroppedImg(
				this.imageRef,
				crop,
				'newFile.jpeg'
			);
			this.setState({ croppedImageUrl });
		}
	}

	getCroppedImg(image, crop, fileName) {
		const canvas = document.createElement('canvas');
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;
		canvas.width = crop.width;
		canvas.height = crop.height;
		const ctx = canvas.getContext('2d');

		ctx.drawImage(
			image,
			crop.x * scaleX,
			crop.y * scaleY,
			crop.width * scaleX,
			crop.height * scaleY,
			0,
			0,
			crop.width,
			crop.height
		);

		return new Promise((resolve, reject) => {
			canvas.toBlob(blob => {
				if (!blob) {
					//reject(new Error('Canvas is empty'));
					console.error('Canvas is empty');
					return;
				}
				blob.name = fileName;
				window.URL.revokeObjectURL(this.fileUrl);
				this.fileUrl = window.URL.createObjectURL(blob);
				resolve(this.fileUrl);
			}, 'image/jpeg');
		});
	}

	render() {
		const { crop, croppedImageUrl, src } = this.state;

		return (
			<AppWrapper>
				<div>
					<input type='file' accept='image/*' onChange={this.onSelectFile} />
				</div>
				{src && (
					<ReactCrop
						src={src}
						crop={crop}
						ruleOfThirds
						onImageLoaded={this.onImageLoaded}
						onComplete={this.onCropComplete}
						onChange={this.onCropChange}
					/>
				)}
				{croppedImageUrl && (
					<img alt='Crop' style={{ maxWidth: '100%' }} src={croppedImageUrl} />
				)}
			</AppWrapper>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('root'));
