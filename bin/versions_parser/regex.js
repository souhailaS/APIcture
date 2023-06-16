
export default  [
    {
      "semver-2#": /^(v|)(\d{3}|\d{2}|\d{1})\.\d+/i,
    },
    {
      "semver-3#": /^(v|)\d+\.(\d{3}|\d{2}|\d{1})\.\d+/,
    },
    {
      "semver-4#": /^(v|)\d+\.\d+\.\d+\.\d+/,
    },
    {
      "semver-5#": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+/,
    },
    {
      "semver-6#": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+/,
    },
    {
      "#semver-2": /(v|)(\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "#semver-3": /(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/,
    },
    {
      "#semver-4": /(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+\.\d+$/,
    },
    {
      "#semver-5": /(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+\.\d+\.\d+$/,
    },
    {
      "#semver-6": /(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+\.\d+\.\d+\.\d+$/,
    },
  
    { integer: /^(\d{3}|\d{2}|\d{1})$/i },
    { "v*": /^v\d$/i },
    { v: /^v$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}\.\d{2}\.\d{2}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}\.\d{2}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}-\d{2}-\d{2}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}-\d{2}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}\/\d{2}\/\d{2}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}\/\d{2}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}\d{2}\d{2}$/i },
    { "v*-date": /^v\d+(-|\.| )\d{4}\d{2}$/i },
    {
      "v*-date":
        /^v\d+(-|\.| )20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/i,
    },
  
    { "v*.beta": /^v\d+(\.|-)beta\d*$/i },
  
    { "v*beta*": /^v\d+beta\d*$/i },
    { "v*rc*": /^v\d+rc\d*$/i },
    { "v*alpha*": /^v\d+alpha\d*$/i },
    { "v*dev*": /^v\d+dev\d*$/i },
    { "v*pre*": /^v\d+pre\d*$/i },
    { "*beta*": /^\d+beta\d*$/i },
    { "v*beta*.*": /^v\d+beta\d+\.\d+$/i },
    { "v*rc*.*": /^v\d+rc\d+\.\d+$/i },
    { "v*alpha*.*": /^v\d+alpha\d+\.\d+$/i },
    { "v*dev*.*": /^v\d+dev\d+\.\d+$/i },
    { "v*pre*.*": /^v\d+pre\d+\.\d+$/i },
    { "v*snapshot*.*": /^v\d+snapshot\d+$/i },
  
    { "date(yyyy.mm.dd)": /\d{4}\.\d{2}\.\d{2}$/i },
    { "date(yyyy.mm)": /^\d{4}\.\d{2}$/i },
    { "date(yyyy.m)": /^\d{4}\.[1-12]$/i },
    { "date(yyyy)": /^\d{4}$/i },
    { "date(yyyy-mm-dd)": /^\d{4}-\d{2}-\d{2}/i },
    { "date(yyyy-mm)": /^\d{4}-\d{2}$/i },
    { "date(yyyy/mm/dd)": /^\d{4}\/\d{2}\/\d{2}$/i },
    { "date(yyyy/mm)": /^\d{4}\/\d{2}$/i },
    {
      "date(yyyymmdd)": /^20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/i,
    },
    {
      "date(Month yyyy)":
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
  
    {
      "date-semver": /\d{4}\.\d{2}\.\d{2}(-| |\.)(v|)(\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "date-semver":
        /\d{4}\.\d{2}\.\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}\.\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}\.\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}\.[1-12](-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}\.[1-12](-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}-\d{2}-\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "date-semver":
        /^\d{4}-\d{2}-\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}-\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}-\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/i,
    },
    {
      "date-semver":
        /^\d{4}\/\d{2}\/\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+$/i,
    },
    {
      "date-semver":
        /^\d{4}\/\d{2}\/\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+\.\d+$/i,
    },
    {
      "date-semver": /^\d{4}\/\d{2}(-| |\.)(v|)(\d{3}|\d{2}|\d{1})+\.\d+$/i,
    },
  
    { "semver-SNAPSHOT*": /^(v|)\d+\.\d+(\.|-)SNAPSHOT\d*$/i },
    { "semver-SNAPSHOT*": /^(v|)\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*$/i },
    { "semver-SNAPSHOT*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*$/i },
    { "semver-SNAPSHOT*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*$/i },
    {
      "semver-SNAPSHOT*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*$/i,
    },
  
    { "semver-SNAPSHOT*.*": /^(v|)\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*\.\d+$/i },
    { "semver-SNAPSHOT*.*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*\.\d+$/i },
    {
      "semver-SNAPSHOT*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*\.\d+$/,
    },
    {
      "semver-SNAPSHOT*.*":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)SNAPSHOT\d*\.\d+$/,
    },
    { "semver-rc*": /^(v|)\d+\.\d+(\.|-)rc\d*$/i },
    { "semver-rc*": /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*$/i },
    { "semver-rc*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*$/i },
    { "semver-rc*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*$/i },
    { "semver-rc*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*$/i },
  
    { "semver-rc*.*": /^(v|)\d+\.\d+-rc\d*\.\d+$/i },
    { "semver-rc*.*": /^(v|)\d+\.\d+\.\d+-rc\d*\.\d+$/i },
    { "semver-rc*.*": /^(v|)\d+\.\d+\.\d+\.\d+-rc\d*\.\d+$/i },
    { "semver-rc*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+-rc\d*\.\d+$/i },
    { "semver-rc*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+-rc\d*\.\d+$/i },
  
    { "semver-beta*": /^(v|)\d+\.\d+(\.|-)beta\d*$/i },
    { "semver-beta*": /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*$/i },
    { "semver-beta*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*$/i },
    { "semver-beta*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*$/i },
    { "semver-beta*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*$/i },
  
    { "semver-beta*.*": /^(v|)\d+\.\d+(\.|-)beta\d*\.\d+$/i },
    { "semver-beta*.*": /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*\.\d+$/i },
    { "semver-beta*.*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*\.\d+$/i },
    { "semver-beta*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*\.\d+$/i },
    { "semver-beta*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*\.\d+$/i },
  
    { "semver-alpha*": /^(v|)\d+\.\d+(\.|-)alpha\d*$/i },
    { "semver-alpha*": /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*$/i },
    { "semver-alpha*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*$/i },
    { "semver-alpha*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*$/i },
    { "semver-alpha*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*$/i },
  
    { "semver-alpha*.*": /^(v|)\d+\.\d+(\.|-)alpha\d*\.\d+$/i },
    { "semver-alpha*.*": /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*\.\d+$/i },
    { "semver-alpha*.*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*\.\d+$/i },
    { "semver-alpha*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*\.\d+$/i },
    {
      "semver-alpha*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*\.\d+$/,
    },
  
    { "semver-preview*": /^(v|)\d+\.\d+(\.|-)preview$/i },
    { "semver-preview*": /^(v|)\d+\.\d+\.\d+(\.|-)preview$/i },
    { "semver-preview*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)preview$/i },
    { "semver-preview*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)preview$/i },
    { "semver-preview*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)preview$/i },
  
    { "semver-preview*.*": /^(v|)\d+\.\d+(\.|-)preview\d*\.\d+$/i },
    { "semver-preview*.*": /^(v|)\d+\.\d+\.\d+(\.|-)preview\d*\.\d+$/i },
    { "semver-preview*.*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)preview\d*\.\d+$/i },
    {
      "semver-preview*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)preview\d*\.\d+$/i,
    },
    {
      "semver-preview*.*":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)preview\d*\.\d+$/,
    },
    { "date-preview*": /^\d{4}-\d{2}-\d{2}(-|\.)preview$/i },
    { "date-preview*": /^\d{4}\.\d{2}$-preview/i },
    { "date-preview*": /^\d{4}\.\d{2}\.\d{2}-preview$/i },
  
    { "date-preview*.*": /^\d{4}-\d{2}-\d{2}-preview\d*\.\d+$/i },
  
    { "semver-dev*": /^(v|)\d+\.\d+(\.|-)dev\d*$/i },
    { "semver-dev*": /^(v|)\d+\.\d+\.\d+(\.|-)dev\d*$/i },
    { "semver-dev*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)dev\d*$/i },
    { "semver-dev*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)dev\d*$/i },
    { "semver-dev*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)dev\d*$/i },
  
    { "semver-dev*.*": /^(v|)\d+\.\d+(\.|-)dev\d*\.\d+$/i },
    { "semver-dev*.*": /^(v|)\d+\.\d+\.\d+(\.|-)dev\d*\.\d+$/i },
    { "semver-dev*.*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)dev\d*\.\d+$/i },
    { "semver-dev*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)dev\d*\.\d+$/i },
    { "semver-dev*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)dev\d*\.\d+$/i },
  
    { "semver-pre*": /^(v|)\d+\.\d+(\.|-)pre\d*$/i },
    { "semver-pre*": /^(v|)\d+\.\d+\.\d+(\.|-)pre\d*$/i },
    { "semver-pre*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)pre\d*$/i },
    { "semver-pre*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)pre\d*$/i },
    { "semver-pre*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)pre\d*$/i },
  
    { "semver-pre*.*": /^(v|)\d+\.\d+(\.|-)pre\d*\.\d+$/i },
    { "semver-pre*.*": /^(v|)\d+\.\d+\.\d+(\.|-)pre\d*\.\d+$/i },
    { "semver-pre*.*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)pre\d*\.\d+$/i },
    { "semver-pre*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)pre\d*\.\d+$/i },
    { "semver-pre*.*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)pre\d*\.\d+$/i },
  
    { "semver-2": /^V.(\d{3}|\d{2}|\d{1})\.\d+$/i },
    { "semver-2": /^(v|)(\d{3}|\d{2}|\d{1})\.\d+$/i },
    { "semver-3": /^(v|)(\d{3}|\d{2}|\d{1})\.\d+\.\d+$/i },
    { "semver-4": /^(v|)\d+\.\d+\.\d+\.\d+$/i },
    { "semver-5": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+$/i },
    { "semver-6": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+$/i },
  
    { "stable*": /^(S|s)table\d*$/i },
    { "latest*": /^(L|l)atest\d*$/i },
    { "SNAPSHOT*": /^SNAPSHOT\d$/i },
    { "rc*": /^rc\d*$/i },
    { "beta*": /^beta\d*$/i },
    { "alpha*": /^alpha\d*$/i },
    { "preview*": /^preview\d*$/i },
    { "dev*": /^dev\d*$/i },
    { "pre*": /^pre\d*$/i },
    { "develop*": /^develop\d*$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/i },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    { "semver.rc*.date": /^(v|)\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}$/i },
    {
      "semver.rc*.date": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\.\d{2}$/,
    },
    { "semver.rc*.date": /^(v|)\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d.\d{4}$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}$/i },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}$/,
    },
    { "semver.rc*.date": /^(v|)\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}-\d{2}$/i },
    {
      "semver.rc*.date": /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}-\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}-\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}-\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}-\d{2}$/,
    },
    { "semver.rc*.date": /^(v|)\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}$/i },
    {
      "semver.rc*.date": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}$/i,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}-\d{2}$/,
    },
    { "semver.rc*.date": /^(v|)\d+\.\d+(\.|-)rc\d.\d{4}\/\d{2}\/\d{2}$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+\.\d+(\.|-)rc\d.\d{4}\/\d{2}\/\d{2}$/i },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    { "semver.rc*.date": /^(v|)\d+\.\d+.rc\d*(\.|-)\d{4}\/\d{2}$/i },
    { "semver.rc*.date": /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\/\d{2}$/i },
    {
      "semver.rc*.date": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+.rc\d.20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+(\.|-)rc\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/i,
    },
    {
      "semver.rc*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)rc\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/i,
    },
    // Beta versions
    {
      "semver (beta*)": /^(v|)\d+\.\d+(\.|-| )\(beta\d*\)/i,
    },
    {
      "semver (beta*)": /^(v|)\d+\.\d+\.\d+(\.|-| )\(beta\d*\)/i,
    },
    {
      "semver (beta*)": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-| )\(beta\d*\)/i,
    },
    {
      "semver (beta*)": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-| )\(beta\d*\)/i,
    },
    {
      "semver beta*": /^(v|)\d+\.\d+(\.|-| )beta\d*/i,
    },
    {
      "semver beta*": /^(v|)\d+\.\d+\.\d+(\.|-| )beta\d*/i,
    },
    {
      "semver beta*": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-| )beta\d*/i,
    },
    {
      "semver beta*": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-| )beta\d*/i,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/i,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+.beta\d.20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)20[1-2][0-9](0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+(\.|-)beta\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20[1-2][0-9]$/,
    },
    {
      "semver.beta*.date": /^(v|)\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.beta*.date": /^(v|)\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    { "semver.beta*.date": /^(v|)\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}$/i },
    {
      "semver.beta*.date": /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}$/i,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\/\d{2}$/,
    },
    { "semver.beta*.date": /^(v|)\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}$/i },
    { "semver.beta*.date": /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}$/i },
    { "semver.beta*.date": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}$/i },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}$/,
    },
    { "semver.beta*.date": /^(v|)\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}$/i },
    {
      "semver.beta*.date": /^(v|)\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}$/i,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}$/,
    },
    {
      "semver.beta*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)beta\d*(\.|-)\d{4}\-\d{2}$/,
    },
    { "v*p*beta*": /v\d+p\d+beta\d*/ },
    // semver (alpha)
    { "semver (alpha*)": /^(v|)\d+\.\d+(\.|-| )\(alpha\d*\)$/i },
    { "semver (alpha*)": /^(v|)\d+\.\d+\.\d+(\.|-| )\(alpha\d*\)$/i },
    { "semver (alpha*)": /^(v|)\d+\.\d+\.\d+\.\d+(\.|-| )\(alpha\d*\)$/i },
    { "semver (alpha*)": /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-| )\(alpha\d*\)$/i },
    {
      "semver (alpha*)":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-| )\(alpha\d*\)$/i,
    },
  
    //semver.alpha*.date(yyyy.mm.dd)
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}\.\d{2}$/,
    },
    //semver.alpha*.date(yyyy/mm/dd)
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}\/\d{2}$/,
    },
    //semver.alpha*.date(yyyy-mm-dd)
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}\-\d{2}$/,
    },
    //semver.alpha*.date(yyyy.mm)
    { "semver.alpha*.date": /^(v|)\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/i },
    {
      "semver.alpha*.date": /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    //semver.alpha*.date(yyyy/mm)
    { "semver.alpha*.date": /^(v|)\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}$/i },
    {
      "semver.alpha*.date": /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\/\d{2}$/,
    },
    //semver.alpha*.date(yyyy-mm)
    { "semver.alpha*.date": /^(v|)\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}$/i },
    {
      "semver.alpha*.date": /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\-\d{2}$/,
    },
    { "semver.alpha*.date": /^(v|)\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/i },
    {
      "semver.alpha*.date": /^(v|)\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "semver.alpha*.date":
        /^(v|)\d+\.\d+\.\d+\.\d+\.\d+\.\d+(\.|-)alpha\d*(\.|-)\d{4}\.\d{2}$/,
    },
    {
      "V.*.*": /V\.\d+\.\d/i,
    },
  ];
  