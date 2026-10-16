# Personal Portfolio

Open index.html in a browser; there is no build or installation step.

## Customize

Replace every [YOUR ...] placeholder in the three HTML files, including name, email, company, role, biography, and social URLs. Replace the SVGs in assets/images with your photos and project screenshots, or keep filenames and swap the files. Edit each project card directly in index.html.

Colors, responsive layout, and typography are centralized in css/style.css. The js/script.js file contains navigation, carousel, scroll reveal, disclosure, and form logic.

## Dependencies

Sora (Google Fonts) and Font Awesome icons load from public CDNs. The website itself needs no package installation.

## Contact form

The contact form sends inquiries through Web3Forms using the public access key in contact.html. Messages go to the email address associated with that key. The form validates fields, includes a spam honeypot, prevents duplicate submissions while sending, and shows success or error feedback without leaving the page. Failed submissions preserve the visitor’s message for retrying. To change the receiving inbox, create a Web3Forms access key for that email and replace the access_key value in contact.html.

## Included

- Mobile navigation, focus styles, skip links, and reduced-motion support
- Centered keyboard/swipe carousel with controls and dots
- Responsive portrait placeholders, repeated platform motif, and magenta project glow
- Expandable experience entries and accessible contact validation
