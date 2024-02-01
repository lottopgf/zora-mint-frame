# Zora Mint Frame

This nextjs app will embed a free mint frame in Warpcast 🎉

It's powered by the Neynar API that checks like and recast status of the post that embeds this frame.

## Zora setup

Any 1155 collection on Zora should be supported, if you need ERC721 support please open an issue!

To be able to do free admin mints you need to add the address of your minter account (corresponding to the private key in `MINTER_PRIVATE_KEY`) as an admin of your collection: `Manage collections > Your collection > Collaborators`

## Code setup

```
$ yarn
```

1. Copy `.env.example` to `.env.local` (or put the variables in your environment) and update the values.
2. Update the `src/config.ts` file with your chain, contract address and collection token ID

For added security you might want to enable KV on vercel! This will save any sucessful mint requests and prevent people to spam free mints.

## Customize

- Update the pictures in `public/status/` and `src/app/opengraph-image.png`
- Go through all the files and update texts as needed. It's not that many I know you can do it!

## Gotchas

- The free mint will run until the minter account is out of funds, then everyone will just get an error :P
- If you don't add KV people might be able to spam your frame to get multiple free mints! Didn't test tho

## Contact

Any questions? Ping me on [Farcaster @owl](https://warpcast.com/owl)!

If you feel like donating some funds for more fun stuff 😘 `0xFd37f4625CA5816157D55a5b3F7Dd8DD5F8a0C2F`

```
@owl out 🫡
  .___.
  (o,o)
  (\+/)
   ^ ^
```
