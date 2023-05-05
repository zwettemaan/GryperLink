# GryperLink

Gryperlink.jsx - a script for Adobe InDesign

v 1.0.8, May 5, 2021

by Kris Coppieters 
kris@rorohiko.com
https:www.linkedin.com/in/kristiaan/

# About Rorohiko

Rorohiko specialises in making printing, publishing and web workflows more efficient.

This script is a free sample of the custom solutions we create for our customers.

If your workflow is hampered by boring or repetitive tasks, inquire at

  sales@rorohiko.com

The scripts we write for our customers repay for themselves within weeks or 
months.

# About GryperLink

This script will search the current document for one or more 
GREP patterns, and each time a match is found, it will assign a
specific hyperlink to the matching text. 

For licensing and copyright information: see end of the script

For more installation info and documentation: visit 

https://www.rorohiko.com/wordpress/use-indesign-find-and-replace-to-assign-hyperlinks-to-text

The default sample that is configured into `GryperLink.js` will search for a pattern 
of six digits, a dash, 2 digits. Each time the pattern is found, a hyperlink of the 
form https://coppieters.nz/?p=123456-12 will be assigned to it.

The searchPattern should use the 'g' flag (i.e. the pattern ends with the letter
g, which means 'Global'): '/.../g').

That way, the GREP expression will search for all matches, instead of just one match.

In addition to matching the text against a GREP pattern you can optionally also
match any or all of the names of the paragraph style, character style 
or font. If you don't want such matching, keep the corresponding 
search patterns set to 'undefined'.

These additional patterns do not need the 'g' flag

Also note that you can always append an 'i' flag to any GREP expressions
to make them case-insensitive

This additional matching is helpful if matching against the text leads
to too many 'false positives' and the text match alone is not specific
enough to designate the hyperlink locations.

To use this script, you must configure it - the pattern and link below are merely
samples. Carefully make sensible adjustments between the two lines
'CONFIFURATION' - 'END OF CONFIGURATION' below

## How to install GryperLink

Start InDesign

Bring up the Scripts Panel (_Window - Utilities - Scripts_)

Right-click the 'User' folder on this panel, and select 
_Reveal in Finder_ or _Reveal in Explorer_

A folder should open in the Finder or Explorer. 

One more step: double click the _Scripts Panel_ folder icon
to get _into_ the _Scripts Panel_ folder. 

Once you have the _Scripts Panel_ folder open, drag the
whole _GryperLink_ folder into it.

Switch back to InDesign. _GryperLink_ should now appear on the 
Scripts Panel in InDesign.

You can now run the GryperLink by double-clicking
_run\_as\_ExtendScript.jsx_

If you are using InDesign 18.2 or higher, you can also click
_run\_as\_UXPScript.idjs_ on the Scripts Panel.

These two 'wrappers' run the exact same script (_GryperLink.js_)
either as an ExtendScript or as a UXPScript. 

Note: in InDesign 18.2, running as UXPScript is slower 
than running as ExtendScript.

## License

Gryperlink.jsx

(c) 2018-2023 Rorohiko Ltd. - Kris Coppieters - kris@rorohiko.com

File: Gryperlink.jsx

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Rorohiko Ltd., nor the names of its contributors
  may be used to endorse or promote products derived from this software without
  specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.

