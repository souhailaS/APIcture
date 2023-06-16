
import semver from 'semver';

/**
 * 
 * @param {*} versions 
 * versions is an array objects with the following structure:
 * {
 * hash: the commit sha 
 * commit_date: the commit date
 * version: the version string
 * version_format: the version format
 * version_format_class: the version format class
 * }
 * The function returns a list of objects with the following structure:
 * {
 * from: the version string
 * to: the version string
 * from_release_type: the release type of the from version
 * to_release_type: the release type of the to version
 * commit_date: the commit date
 * upgrade_type: the upgrade type
 * from_hash: the commit sha of the from version
 * to_hash: the commit sha of the to version
 * }
 */
export function detectChanges(versions){
    var upgrades = [];
    for(var i = 0; i < versions.length - 1; i++){
      // if is semantic versioning
        if(semver.valid(versions[i].version) && semver.valid(versions[i+1].version)){
            var from = versions[i].version;
            var to = versions[i+1].version;
            var upgrade_type = semver.diff(from, to);
            if(upgrade_type){
            var from_release_type =  versions[i].version_format_class;
            var to_release_type = versions[i+1].version_format_class;
            var commit_date = versions[i+1].commit_date;
            
            var from_hash = versions[i].hash;
            var to_hash = versions[i+1].hash;

            // check if the change is forward or backward
           
            upgrades.push({
                from: from,
                to: to,
                from_release_type: from_release_type,
                to_release_type: to_release_type,
                commit_date: commit_date,
                upgrade_type: upgrade_type,
                from_hash: from_hash,
                to_hash: to_hash,
                backwards: semver.gt(from, to)
            });
        }
        }
    }
    return upgrades;
}