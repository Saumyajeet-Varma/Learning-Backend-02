import { Router } from "express"
import { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const playlistRouter = Router();

// Apply verifyJWT middleware to all routes in this file
playlistRouter.use(verifyJwt);

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/playlists/
playlistRouter
    .route("/")
    .post(createPlaylist)

// http://localhost:8000/api/v1/playlists/:playlistId
playlistRouter
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

// http://localhost:8000/api/v1/playlists/add/:videoId/:playlistId
playlistRouter
    .route("/add/:videoId/:playlistId")
    .patch(addVideoToPlaylist);

// http://localhost:8000/api/v1/playlists/remove/:videoId/:playlistId
playlistRouter
    .route("/remove/:videoId/:playlistId")
    .patch(removeVideoFromPlaylist);

// http://localhost:8000/api/v1/playlists/u/:userId
playlistRouter
    .route("/u/:userId")
    .get(getUserPlaylists);

export default playlistRouter