/**
 *
 */

import clone from "./clone_repos.js";
import generateGallery  from "./test_repos_genviz.js";

export default async function vissoft() {
  var cloneFolder = await clone();
  await generateGallery(cloneFolder);
}
