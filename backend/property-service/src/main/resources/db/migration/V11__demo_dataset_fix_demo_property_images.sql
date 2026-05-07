-- Fix demo property images to use public Cloudinary upload URLs (no Cloudinary fetch)
-- This avoids 401 errors when Cloudinary "fetch" delivery type is restricted.

UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/2eb5b8ad-0b32-410e-98e1-311b8c81bf33_k83xkn.avif' WHERE id = 20001;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/e916c971-0e58-4dcf-b13e-dbef345e5013_tkalld.avif' WHERE id = 20002;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/a709572e-f938-41f4-8de0-41840322972a_opb1b2.avif' WHERE id = 20003;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/3241620c-b81f-4b06-9147-c3316d41edd8_zftkfv.avif' WHERE id = 20004;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/6a4147ba-1c4d-48dd-8983-4bfa84773ea5_g64dys.avif' WHERE id = 20005;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/80e44391-928d-4645-baad-b7530fdcd3d5_lxa34f.avif' WHERE id = 20006;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/6dffbe95-f4c8-4def-8661-5e8b666d2a33_pbgnjf.avif' WHERE id = 20007;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/45671ecb-fd4f-4f0f-8b8b-f9ee3e9277b4_ptk9xl.avif' WHERE id = 20008;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/69f498e1-9046-4684-ab5a-32812b02a087_kjbcex.avif' WHERE id = 20009;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/b42bf256-f154-4a59-a2c3-137744b28ce7_nnyhvj.avif' WHERE id = 20010;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/ee133f4a-1dc0-4bbf-a24d-69fe2bf68bed_nsg1ip.avif' WHERE id = 20011;
UPDATE properties SET image_url = 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/de9bb0a6-225c-4744-9e5d-899cc80479d7_whhmq5.avif' WHERE id = 20012;
