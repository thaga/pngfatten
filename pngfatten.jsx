import 'js/web.jsx';
import 'console.jsx';

class _Main {
	static function main(args:string[]):void {
		var rcv = dom.id('rcv') as HTMLDivElement; // DnD receiver

		rcv.ondragover = function(e:Event):void {
			e.preventDefault();
		};
		rcv.ondrop = function(e:Event):void {
			e.preventDefault();

			var de = e as __noconvert__ DragEvent; // CAUTION: Chrome creates MouseEvent
			var file = de.dataTransfer.files[0];

			var file_reader = new FileReader;
			file_reader.onload = function(e:Event):void {
				// now file reading complete
				var img = dom.document.createElement('img') as HTMLImageElement;
				img.onload = function(e:Event):void {
					// now image creation complete

					// process image
					var img_fat = _Main.fatten(img);

					// display result
					dom.document.body.appendChild(img);
					dom.document.body.appendChild(img_fat);
				};
				img.src = (e.target as FileReader).result as __noconvert__ string;
			};
			file_reader.readAsDataURL(file);
		};
	}

	static function fatten(img_org:HTMLImageElement):HTMLImageElement {
		// create canvas
		var cv = dom.document.createElement('canvas') as HTMLCanvasElement;
		cv.width = img_org.width;
		cv.height = img_org.height;
		// copy image to canvas
		var ctx = cv.getContext('2d') as CanvasRenderingContext2D;
		ctx.drawImage(img_org, 0, 0);

		// get image data
		var img_data = ctx.getImageData(0, 0, cv.width, cv.height);
		var pixels = img_data.data;

		// process image data
		_Main.fatten(pixels, cv.width, cv.height);

		// redraw
		ctx.putImageData(img_data, 0, 0);

		// return fatten image
		var img_fat = dom.document.createElement('img') as HTMLImageElement;
		img_fat.src = cv.toDataURL('image/png');
		return img_fat;
	}

	static function fatten(px:Uint8ClampedArray, w:int, h:int):void {
		// clone pixel array
		var px2 = new Uint8ClampedArray(px);

		// process loop
		for (var y = 0; y < h; ++y) for (var x = 0; x < w; ++x) {
			var bi = (y * w + x) * 4; // base index

			if (px[bi+3] != 0) continue; // skip if alpha is not 0

			var r = 0, g = 0, b = 0, a = 0;

			// sampling loop
			for (var dy = -1; dy <= 1; ++dy) {
				var sy = y + dy; // sample y
				if (sy < 0 || sy >= h) continue;
				for (var dx = -1; dx <= 1; ++dx) {
					if (dx == 0 && dy == 0) continue; // cancel center

					var sx = x + dx; // sample x
					if (sx < 0 || sx >= w) continue;

					var sbi = (sy * w + sx) * 4; // sample base index

					var sa = px2[sbi + 3]; // sampled alpha
					r += px2[sbi] * sa;   // alpha weighted color
					g += px2[sbi+1] * sa; // alpha weighted color
					b += px2[sbi+2] * sa; // alpha weighted color
					a += sa;
				}
			}

			if (a == 0) continue; // no opaque pixel around here

			px[bi] = r / a;
			px[bi+1] = g / a;
			px[bi+2] = b / a;
		}
	}
}


