import {FREE_GAME_TESTING,FREE_HOST_GAME_TESTING} from '../../lib/testing-access.js';
export function onRequestGet(){return Response.json({freeGameTesting:FREE_GAME_TESTING,hostFreeTesting:FREE_HOST_GAME_TESTING},{headers:{'Cache-Control':'no-store'}})}
