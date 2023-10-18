/**
 *
 */

import clone from "./clone_repos.js";
import generateGallery  from "./test_repos_genviz.js";

export default async function test_apicture() {
  var cloneFolder = await clone();
  await generateGallery(cloneFolder);
}
