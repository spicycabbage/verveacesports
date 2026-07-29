-- Re-seed all Judge.me product reviews (39) onto matching catalog products.
-- Idempotent: clears previous legacy imports, then inserts current scrape.

delete from public.product_reviews
where source = 'legacy';

with seed(slug, rating, title, body, author_display_name, is_verified_purchase, created_at, external_id) as (
  values
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'Easy to use, but still a lot to learn, no negative aspect so far.',
      'Tünde Gal-Berey',
      true,
      '2026-07-02T20:05:57+00:00'::timestamptz,
      '369664a1-7ae7-4ead-addd-8226bd13a9f4'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      4,
      null,
      'Works nice. It is just a shame it can only record in 3K with iPhone and also the time it takes to initialize. Other than that, no complains. You get the quality of image you would expect of such a small camera.',
      'Stephen',
      true,
      '2026-06-30T19:51:56+00:00'::timestamptz,
      '3f61ae91-41dc-5ec9-b24d-ff3a9809ddca'
    ),
    (
      'bleequp-ranger-standard-lens',
      5,
      null,
      'Functional products, the good effect and practicality of all kinds of gloves, good photography effect, are sports products worth mentioning and can continue to be used.',
      'Yuet ching Lai',
      true,
      '2026-06-30T02:07:46+00:00'::timestamptz,
      'd4e13a88-cf41-4676-9946-c7043a40b233'
    ),
    (
      'bleequp-ranger-standard-lens',
      1,
      null,
      'Only for cyclists, play music without prompting, can never tell whether they''re on or off. Horrible.',
      'Colin Shipton',
      true,
      '2026-06-27T17:44:12+00:00'::timestamptz,
      '264e24bb-f5f1-4ece-84e5-b6a0f9a51bd4'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'Really really good quality and perfect for athletes.',
      'Melih Akyazililar',
      true,
      '2026-06-22T18:20:33+00:00'::timestamptz,
      '9768d237-7444-44ff-834c-feaf2f4b8301'
    ),
    (
      'bleequp-ranger-standard-lens',
      5,
      null,
      'This is a great product. I enjoy the whole view it shows when I am looking at the video. Audio sound great as well.',
      'Natasha Armstrong',
      true,
      '2026-06-18T00:14:38+00:00'::timestamptz,
      'c44083c0-de6e-496b-b7aa-42de5d2296ef'
    ),
    (
      'bleequp-ranger-standard-lens',
      5,
      null,
      'love these sunglasses. the fact im playing music and I can record videos is just everything!!! I used them know a bright hot sunshine 🌞 day in NYC. I was pleased to say the very least. these are worth it!!! I also bought the Bluetooth remote super helpful and worth it to Nd I have the battery pack. I didnt have to use it yet. the battery lastlong for the amount of pics, videos and playing music that I did while bike riding.',
      'Owen Ashley',
      true,
      '2026-06-17T14:49:03+00:00'::timestamptz,
      '9def956e-0914-4671-b64e-4cce700273ec'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      3,
      null,
      '⭐ BleeqUp Ranger – Honest User Review Rating: 3.5 / 5 stars',
      'Oleg Wagenleitner',
      true,
      '2026-06-08T12:57:11+00:00'::timestamptz,
      'f59e4b84-c8d0-4e7f-ad08-a4c9a6833ea3'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'Best glasses I’ve ever had!! Speakers and camera are great!',
      'Gary Wakefield',
      true,
      '2026-06-01T21:50:02+00:00'::timestamptz,
      '8048bb08-170e-4b53-9222-483e01a84a80'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'Just taken the glasses for a test on an MTB trip to Croatia. I didn’t really do any ‘homework’ before I went so I was hoping they’d be easy to use etc. They did not disappoint with the only issue being the connection to the glasses WiFi as it interfered with my VPN settings. Once I worked that out everything was seamless. Easy to wear, easy to switch on and off and great functionality. The footage is excellent, clear and without the usual movement issues. Highly recommended and I haven’t even used the AI function yet which seems to be excellent',
      'AJ - Guernsey',
      true,
      '2026-05-22T07:29:11+00:00'::timestamptz,
      'e5307087-a8ce-4dfc-86ab-f5f86c798754'
    ),
    (
      'bleequp-ranger-standard-lens',
      4,
      null,
      'Feels like great quality, definitely not paper thin & flimsy. Sturdy & looks amazing',
      'Mosell',
      true,
      '2026-05-13T19:58:32+00:00'::timestamptz,
      '16e822da-4a2e-5b43-8fae-995f12ad22b9'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      4,
      null,
      'Work great as sunglasses as well. Intuitive, easy to use and decent pictures. So nice to pan videos easily while riding. Landscapes aren’t as good as I had hoped but as expected without zoom capability. Unfortunately they don’t fit well with my Giro helmet and push down too hard on my nose. Nose piece adjustment did help.',
      'Dan Hofstra',
      true,
      '2026-05-08T20:15:21+00:00'::timestamptz,
      '6f4e22c3-42df-4657-981d-cd70283897a9'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      4,
      null,
      'Awesome glasses, robust, quality lenses from Zeiss and good photos/films, the microphones could get an improvement when recording on stereo mode (no wind scenario), they capture my breath in a way that only editing the audio solves it if you want to share them.',
      'Caio Chadi',
      true,
      '2026-05-06T19:38:45+00:00'::timestamptz,
      '41de4488-7dfa-4381-98da-8a38390bf693'
    ),
    (
      'bleequp-ranger-standard-lens',
      4,
      null,
      'Nice glasses! Wish it would be easier to switch between modes',
      'Altius',
      true,
      '2026-04-22T12:20:46+00:00'::timestamptz,
      '503dea04-ed68-489f-90e9-c3db075e48e2'
    ),
    (
      'bleequp-ranger-standard-lens',
      5,
      null,
      'Materiales de calidad',
      'M.Á.Ú.L.',
      true,
      '2026-04-17T05:02:21+00:00'::timestamptz,
      'a6361798-59e8-5206-bab4-afb842f0470a'
    ),
    (
      'bleequp-ranger-ultimate-bundle',
      5,
      null,
      'These glasses are for anyone who wants to stay plugged in while keeping their hands free. They bridge the gap between functional utility and urban style. While they won''t replace a nigh-end Sony setup for serious photography, they are perfect for capturing the vibe of the moment and staying on top of your day.',
      'Edwin',
      true,
      '2026-04-15T23:30:05+00:00'::timestamptz,
      'cd6b8422-5954-5a33-ab2f-1cadb2ee8a1e'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      4,
      null,
      'So far so good, would be Great to have AI implemented. And Generate AI videos just with fotos and videos with out recording the whole cycling ride.',
      'Peter Teuschitz',
      true,
      '2026-04-11T16:57:48+00:00'::timestamptz,
      'ad53acb7-f93b-465e-8c86-1ad05e05eca4'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'I use them for dog sports, and they are brilliant for competing and trialing.',
      'Anonymous',
      true,
      '2026-04-07T22:19:47+00:00'::timestamptz,
      'dcbc83ca-d9ab-4d04-8d8d-ea310d35d9a7'
    ),
    (
      'bleequp-ranger-standard-lens',
      3,
      null,
      'I really like the Bleequp Ranger Glasses smooth, they stay positioned on your face. I would liked if you could connect with bike computer and allow the sensors to stay sinced up. Also make the overlay option a little easier to be included in the videos.',
      'Steven Askew',
      true,
      '2026-03-18T07:19:48+00:00'::timestamptz,
      '1d64cca6-4721-43c3-9cb8-a677b17ed366'
    ),
    (
      'bleequp-ranger-ultimate-bundle',
      5,
      null,
      'service is stellar glasses are comfortable',
      's.R.',
      true,
      '2026-03-08T18:01:09+00:00'::timestamptz,
      '2bae7455-f122-5132-b3c0-8cf70b26dee0'
    ),
    (
      'bleequp-ranger-standard-lens',
      5,
      null,
      'I used these glasses for mountain biking: lightweight, practical and ideal for easily shooting videos without the need for additional equipment. I hope new updates will be released soon to allow integration with cycle computers.',
      'Federico',
      true,
      '2026-03-02T20:57:37+00:00'::timestamptz,
      '5328e272-cb8e-44ca-ab67-921c680479de'
    ),
    (
      'bleequp-ranger-ultimate-bundle',
      5,
      null,
      'I don’t trust Meta',
      'Anonymous',
      true,
      '2026-02-09T00:58:29+00:00'::timestamptz,
      '4186ecdd-930e-492f-9eca-ed21844d7469'
    ),
    (
      'bleequp-ranger-ultimate-bundle',
      5,
      null,
      'Great, works well as advertised. However, could do some improvement on the strapping feature of the bleequp powerplus, perhaps could do with rotate and lock mount instead',
      'Anonymous',
      true,
      '2026-02-03T04:18:37+00:00'::timestamptz,
      '958dfa63-f584-4a4f-8709-a1faff57975d'
    ),
    (
      'bleequp-ranger-ultimate-bundle',
      5,
      null,
      'I am very impressed with these glasses. The video quality isn''t 4k but doesn''t need to be for my purposes, 1080p is stll very good. The most impressive feature is the wind noise reduction when using the Rangers to make phone calls. I was cycling at 25-30+ mph and on a phone call with a friend and he heard no wind noise at all, I was as clear as I am when sitting still. Very impressive. The speakers are very good for outside the ear speakers, I''m not an audiophile but the sound of the music is very good. So as to not sound like too much of a fanboy I do have two issues with the glasses. First is the battery life. The claim is 1 hour of battery when filming and I am getting more like 45 minutes. To get significantly more time you have to add their external power bank. The other is a technical issue with the ''wearing sensor'' which they are aware of and hopefully addressing.The say people with smaller heads may have issues but I have a big head and the wearing sensor is hit or miss. If the glasses don''t think they are being worn the video is cut off after 5 minutes and the glasses power off after 15 minutes. There is a way around this, to turn off wearing detection which is what I have done. This works fine but you just have to remember to actually power down the glasses when you are done. On the overall package these issues are minor for my purposes. I am actively recommending the Bleequp Rangers to friends of mine.',
      'Mark Mitman',
      true,
      '2026-02-03T04:17:18+00:00'::timestamptz,
      '702bf556-228c-4a38-8ce4-37d00a1d199f'
    ),
    (
      'bleequp-ranger-ultimate-bundle',
      5,
      null,
      'Very good and simple to use, haven’t tested the true battery life yet, but all appears to be as stated so far. Easier to use, view and download than my Garmin rear facing video footage',
      'Anonymous',
      true,
      '2026-02-03T04:15:46+00:00'::timestamptz,
      'e38d9610-e063-4779-a9f0-efce80653f62'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      4,
      null,
      'J''utilise les RANGER actuellement surtout pour écouter de la musique en streaming pendant mes longues marches Le son est de très bonne qualité ainsi que les photos Les lunettes sont confortables et légères A la fin de l''hiver je les testerai avec mon vélo J''attends les mises à jour dans le futur pour les commandes vocales et surtout la connection avec mon apple watch',
      'Anonymous',
      true,
      '2026-01-20T13:00:43+00:00'::timestamptz,
      '9a8b2cc5-cb3a-46ba-98b9-8ace6291441a'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'Previously submitted 1 star as no follow up to damaged glasses. Have since received great service - replacement lenses and 2nd pair both being delivered free.....amazing!',
      'Anonymous',
      true,
      '2026-01-20T08:08:46+00:00'::timestamptz,
      'c5fdfbbe-6f4f-418b-b068-a9f994d9d34e'
    ),
    (
      'bleequp-ranger-standard-lens',
      4,
      null,
      'The BleeqUp Rangers are actually really nice. I would have liked the option for a 2160p (4k) camera and the maybe some better speakers.',
      'Casper Larsen',
      true,
      '2026-01-10T19:58:34+00:00'::timestamptz,
      '648a8d94-08ea-4d24-a0af-0febea2252fd'
    ),
    (
      'bleequp-ranger-standard-lens',
      3,
      null,
      'Sunglasses is nice and the recording video and voice are very very nice and quality is super good but the battery during fast .',
      'Anonymous',
      true,
      '2026-01-02T13:04:52+00:00'::timestamptz,
      'fe1e5772-23ce-49ca-9864-ea25d70c0a66'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'It‘s so verry good Glases',
      'Peter Lipp',
      true,
      '2025-12-24T12:03:46+00:00'::timestamptz,
      '24ff6878-172f-4804-aa5a-342b19126cb4'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'I love that they are so easy to set up, the quality of the video andpictures are great and I did not have to break the bank to get them',
      'Vickie Gutierrez',
      true,
      '2025-12-03T22:53:14+00:00'::timestamptz,
      'e18ca8ba-4ff1-459c-a6e5-4cf382dc881d'
    ),
    (
      'bleequp-ranger-standard-lens',
      4,
      null,
      'The actual fit is good, the camera quality is very good, the sound from the built-in speakers is second to none, BUT for some reason the glasses keep disconnecting from my phone, however after 3 times of this happening they then stay connected. Apart from this minor fault I highly recommend them, if you can get on lens readout from my Garmin these would be the best sports glasses.',
      'John Robinson',
      true,
      '2025-10-27T16:35:40+00:00'::timestamptz,
      '9ddd1fa7-41f0-4649-8b80-0b8f0a905a7a'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      null,
      'They are really comfortable to wear, and they shoot videos really good even when im flying gliders',
      'Sebastian Fix',
      true,
      '2025-09-21T08:59:32+00:00'::timestamptz,
      '060f160c-54ef-4602-99dc-ec6b1c356c1b'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      '40+km, 2hrs music—Ranger lasts!',
      'Starting with battery at medium charge, playing 2 hours of music, occasionally snapping a picture (so awesome to not have to reach for my phone or wear a Hero Cam) and a few minutes of video recording and made it 40+ km before my first “Battery Low” prompt. Not bad gang!',
      'Mike Bourgeois',
      true,
      '2025-09-16T12:04:02+00:00'::timestamptz,
      '2ad1608c-c843-4fb2-9757-807f7a0c2f54'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      'very ride grins—thanks Ranger!',
      'I kid you not!! EVERY single time I start out on a ride a big grin comes across my face and Ranger is a big BIG part of it!!!',
      'Dale Nimmo',
      true,
      '2025-08-29T16:00:00+00:00'::timestamptz,
      '755be8bb-cd74-4206-ba5f-6268edfa1c4b'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      'Light, comfy BleeqUp Ranger for rides!',
      'My first review of the BleeqUp Ranger glasses, went out for a ride Sunday, very comfortable, not as heavy as I thought they would be, indeed my cycling friend said he was surprised how light they were compared to his glasses',
      'Mark Firman-Andrews',
      true,
      '2025-08-29T16:00:00+00:00'::timestamptz,
      '3521745c-13b8-4e14-aed8-16fe251034a4'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      'Best trail buddy: open ears, great recordings!',
      'Literally one of the best trail companions Love listening to music while having my ears open and getting to record sweet segments!',
      'Dena Ali',
      true,
      '2025-08-21T16:00:00+00:00'::timestamptz,
      'd2157385-e86a-4cda-b3a7-771b208d6dba'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      'Great glasses, awesome sound!',
      'My glasses arrived today and they are fantastic , nice and light, the sound quality listening to music is really great',
      'Andrew Cooke',
      true,
      '2025-08-14T16:00:00+00:00'::timestamptz,
      '80950dd8-fa1c-44f7-880f-c61cfc63b7f8'
    ),
    (
      'bleequp-ranger-zeiss-lens',
      5,
      'Landscape photos from the difficult trek (downhill)',
      'Landscape photos from the difficult trek (downhill)',
      'Philippe Goessens',
      true,
      '2025-08-08T16:00:00+00:00'::timestamptz,
      '7f3a1884-a19b-4212-ad6d-80ed45dde8d5'
    )
)
insert into public.product_reviews (
  product_id,
  user_id,
  order_id,
  rating,
  title,
  body,
  author_display_name,
  is_verified_purchase,
  is_published,
  source,
  created_at
)
select
  p.id,
  null,
  null,
  s.rating,
  s.title,
  s.body,
  s.author_display_name,
  s.is_verified_purchase,
  true,
  'legacy',
  s.created_at
from seed s
join public.products p on p.slug = s.slug;
