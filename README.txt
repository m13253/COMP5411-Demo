================================================================================
                                    Group 19
            Interactive 3D city aerial imagery with skydome shading
                             Yuchen Ma, Xiaozhe Ren
================================================================================

1. Team members

Group 19
* Yuchen Ma   <ymabk@connect.ust.hk>
* Xiaozhe Ren <xiaozhe.ren@connect.ust.hk>

================================================================================

2. Software execution environment

The main file is "shibuya.html". It can be directly opened. There is no need to
use any web server.

The software requires the latest version of either Google Chrome or Mozilla
Firefox,  a GPU supporting OpenGL 4.0 or later,  and at least 8 GiB of RAM.  If
you have problem using the software, consider updating the browser or switch to
another browser.  As the time of writing, the latest version is Chrome 87.0 and
Firefox 83.0.

The package contains model data in low quality (4.6 MiB) and medium quality
(59 MiB) by default.  The high quality (839 MiB) supplementary data package is
available on demand by sending us an email.  Note that the high quality model
demands high RAM and video RAM usage and may not perform well on older systems.

================================================================================

3. How to use the software

You can either use a keyboard and mouse set, or a game controller (e.g. an Xbox
or PlayStation controller.)

3.1 Using keyboard + mouse:

         W             Move forward
         A             Strife left
         S             Move backward
         D             Strife right
       Shift           Descend vertically
       Space           Ascend vertically
Left click and drag    Change the direction of view

3.2 Using an Xbox controller:

         LS            Move laterally
         RS            Change the direction of view
         LT            Descend vertically
         RT            Ascend vertically

3.3 Using a PlayStation controller:

         L             Move laterally
         R             Change the direction of view
         L2            Descend vertically
         R2            Ascend vertically

================================================================================

4. Our workloads

4.1 Yuchen Ma has authored the following files:

  1) shibuya.html
  2) js/registerResource.js  (resource loading manager, preloaded fragment)
  3) src/colorScience.ts     (conversion between CIEXYZ and sRGB linear)
  4) src/DitherShader.ts     (the 8-bit dither shader)
  5) src/main.ts
  6) src/ResourceManager.ts  (resource loading manager, deferred fragment)
  7) src/Shibuya.ts          (main logic, rendering, input processing)
  8) src/SkyBase.ts          (base class for various sky models)
  9) src/SkyHosek.ts         (the Hosek-Wilkie model, including GLSL shaders)
 10) src/SkyPreetham.ts      (the Preetham model, including GLSL shaders and
                              a CPU algorithm)
 11) src/SkyTHREE.ts         (monkey-patching the THREE.js stock sky model)
 12) src/sunPosition.ts      (algorithm to predict the sun position and the
                              sunrise/sunset time)
 13) src/utils.ts
 14) src/waitForNextFrame.ts
 15) src/ArHosekSky          (Hosek's C algorithm ported to TypeScript)
 16) tools/*
 17) The building system

4.2 Xiaozhe Ren has authored the following file:

 1) src/SkyPreethamRen.ts    (including two GLSL shaders)
 2) Xiaozhe Ren helped the team understand every aspect of the Preetham sky
    model and derived many mathematical formulas for this project to realize.

4.3 The following code, included in the package, contains third-party work:

 1) js/script.js             (the bundled JavaScript code, compiled from our
                              TypeScript codebase, along with all third-party
                              dependencies including THREE.js, etc.)
 2) gltf/*.js                (the Shibuya 3D model, base64 encoded)
 3) third-party/draco_*.js   (the DRACO decoder for glTF)
 4) src/third-party/*.ts     (a part of THREE.js source code, type annotated)

================================================================================

5. Behind the scenes

This section describes two major programming challenges: the large size of the
3D model data, and the mathematical complexity of the sky dome shading.

Additionally,  we also make the full workflow in HDR.  Please read on for more
technical details.

5.1. The city model

The city models are converted into glTF format with optional DRACO compression.
The decompression is performed with WebAssembly decoder.

The loading process is progressive as well as fully managed and monitored to
ensure responsiveness. We also built a loading manager to intercept Ajax calls
to guarantee that the software does not require a web server to run.

The total size is 903 MiB.  But we managed to get all of those loaded to the
browser, although they will take more than 6 GiB of RAM.

5.2. The sky model

We have chosen four sky models.  Each of them are implemented differently and
has unique artistic styles.  Most models are implemented in both CPU and GPU
(GLSL) versions.  The GPU version is used to render the scene,  while the CPU
version is for uses described in following sections.

The sky is blue because of two physical effects:  Rayleigh scattering and Mie
scattering.  Rayleigh scattering,  caused by molecules in the air,  redirects
more short wave components of sunlight than long wave ones into the atmosphere.
Mie scattering, caused by haze particles, redistributes skylight evenly to give
a whitish look on overcast days. Their strength can be controlled by the para-
meter "turbidity". Besides, some sky models allows you to configure individual
parameters in the two processes.

5.2.1. The Preetham model

The Preetham model is the de facto standard for rendering sky in realtime.

The official Preetham model is curve-fitted using 3rd-order polynomials,  from
simulation results of 343 directions in a sky dome with 12 different sun posi-
tions and 5 turbidity settings.

The Preetham model is very cheap to compute,  and achieve very good results,
providing luminance and chromaticity in CIExyY colorspace in cd/m^2 unit.

However, the Preetham model fails when the turbidity is less than 2 or greater
than 6, or when the sun is close to the horizon.  Neither does it have shading
information below the horizon. Out-of-bound values must be handled with care.

5.2.2. The Hosek-Wilkie model (Default)

The Hosek-Wilkie model is a majestic improvement to Preetham model.

This model is released in three versions: the full spectrum version, the CIEXYZ
version,  and the sRGB version.  We use the CIEXYZ version and it can provide
results in lumens. That version contains curve-fitted data of 10 turbidity set-
tings and two albedo settings, 3,600 parameters in total, and can produce very
satisfying results.

The full spectrum version can also render the sun disc or simulate other pla-
nets.  However, we do not use that version due to difficulty porting that huge
amount of tabular data to GPU.  Instead, we use a 5780K black body to approxi-
mate the sun disc.

The Hosek-Wilkie model produces an astonishing tint of the horizon and amazing
twilight.

5.2.3. The THREE.js model

THREE.js provides a stock sky model,  which is based on Preetham's paper.  The
difference is that the THREE.js model simulates the Rayleigh scattering,  the
Mie scattering, and the Henyey-Hreenstein Phase stages in realtime, instead of
using pre-fitted values to speed up the computation.

Therefore, this model has more configuration parameters than the previous two.
It also has an artistic look at sunrise,  with highly saturated ground color.
However,  the realisticity of this model is inferior.  The sundisk is larger
than the real life. The luminosity values are nowhere near the real life.

Also,  the THREE.js model only samples 450 nm, 550 nm, 680 nm wavelengths, not
covering the whole spectrum,  even far from the real sRGB primitives (in terms
of the lowest delta-E 2000, near 470 nm, 540 nm, 650 nm), causing severe color
distortion.  Anyhow, the THREE.js model is very pleasing to stare at.

5.2.4. The Preetham model improved by Xiaozhe Ren

Our teammate Xiaozhe Ren, improved the stock THREE.js model by adjusting vari-
ous formulas and constants that are inconsistent with the Preetham paper or our
physical world. The improved model integrates over the whole visible spectrum,
instead of using just three wavelengths.  However, this model runs on the sRGB
colorspace, relying on an inaccurate approximation to convert wavelengths, and
generates only low dynamic range rendering.

One advantage of this model is that,  it has a lot of configurable parameters.
From the refraction index to the depolarization factors, it can accept a lot of
either realistic and unrealistic combinations.

5.3. The sun and the ambient light

We determined the approximate date and time the aerial images were taken to be
10:45 a.m., 14th November, 2014, Japan Standard Time,  using the shadow of the
buildings.  Therefore,  the default sun position is set according to that date
and time.  However,  you can also modify the date and time by yourself because
we have also included an algorithm to determine the sun position, given arbit-
rary date and time.

The city model is lit using a uniform ambient light,  because it is unfeasible
to perform ray tracing at all directions from the sky.  Therefore,  we use the
CPU version of the sky model to tune the color temperature in order to beauti-
fully illuminate the ground for more immersive dusk and dawn scenes.

5.4 Postprocessing effects

The workflow is fully HDR, with the highest luminous intensity of around 10,000
candela.  We try our best to fit the physical world and process the sky using
the absolute CIEXYZ colorspace instead of the sRGB colorspace, the latter being
relative to the D65 standard white point. By using absolute colorspace, we can
adjust the scene to different color temperatures, to give a sepia tint to sun-
rise or sunset.

To deliver the HDR scene to your LDR screen,  we have integrated a postproces-
sing composer pipeline.  The pipeline contains brightness and contrast adjust-
ment, ACES Filmic tone mapping, sRGB gamma correction, and 8-bit dithering.

The brightness and contrast shader uses the illumination information from CPU
version of the sky model to compress the dynamic range.  Our dithering shader
uses 2D Perlin noise to generate random shade variations to eliminate the color
banding issue on the sky dome,  an issue caused by the fact that common compu-
ter display can only display 256 levels of shades,  which is far insufficient
to represent the color gradient faithfully.

The ACES Filmic tone mapping reduces the over-exposure effect when you directly
look at the sun.  It also gives the scene a filmic feeling, especially at the
dawn with the Hosek-Wilkie sky model.

================================================================================

6. Compiling the code

The code is precompiled,  in case you want to compile yourself.  Please follow
the procedure.

 1) Install Node.js.

 2) Go to the root directory and execute
        npm install --include=dev

 3) Then execute
        npx rollup -c
    The compiling procedure takes about 5-10 seconds.

If you want to recompile the models,  refer to "tools/build_all_blobs.sh". You
need to download the original models for this to complete.

================================================================================

7. Legal information

Copyright (c) 2020, Yuchen Ma, Xiaozhe Ren, all rights reserved.

This software contains the following third-party software or materials.

7.1. Shibuya 3D model

渋谷周辺の3Dデータ https://3dcel.com/study/case01/
© 2014 PASCO CORPORATION
クリエイティブ・コモンズ 表示 4.0 国際 ライセンス (CC-BY)
https://creativecommons.org/licenses/by/4.0/

7.2. THREE.js

The MIT License

Copyright © 2010-2020 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

7.3. ArHosekSky

This source is published under the following 3-clause BSD license.

Copyright (c) 2012 - 2013, Lukas Hosek and Alexander Wilkie
Copyright (c) 2020, ported to TypeScript by Yuchen Ma
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * None of the names of the contributors may be used to endorse or promote
      products derived from this software without specific prior written
      permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

7.4. Tweakpane

Copyright (c) 2016 cocopon <cocopon@me.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

7.5. DRACO

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

7.6. Trademarks

Trademarks mentioned in this documents belongs to the corresponding registrant.

================================================================================
                                        Last update: 2020-12-03 09:55:47 UTC
================================================================================
