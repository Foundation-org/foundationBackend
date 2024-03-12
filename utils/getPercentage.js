module.exports.getPercentage = (document, page) => {
  console.log("page", page);
  let result;

  if (page === "SharedLink") {
    result = document?.shareLinkResult;
  } else {
    result = document?.result;
  }

  if (document.whichTypeQuestion === "ranked choise" && result) {
    const totalOptionCount = Object.values(result[0].selected).reduce(
      (acc, value) => acc + value,
      0
    );
    const selectedPercentage = result?.map((item) => {
      const selectedKeys = Object.keys(item?.selected);
      const totalSelected = selectedKeys.reduce(
        (sum, key) => sum + item.selected[key],
        0
      );
      const percentageObject = {};
      selectedKeys.forEach((key) => {
        percentageObject[key] =
          ((item.selected[key] / totalOptionCount) * 100).toFixed(0) + "%";
      });
      return percentageObject;
    });

    let contendedPercentage;
    if (document.whichTypeQuestion === "ranked choise") {
      contendedPercentage = result?.map((item) => {
        if (!item?.contended) return;
        const contendedKeys = Object.keys(item?.contended);
        const totalSelected = contendedKeys.reduce(
          (sum, key) => sum + item.contended[key],
          0
        );
        const percentageObject = {};

        contendedKeys.forEach((key) => {
          percentageObject[key] =
            ((item.contended[key] / document.totalStartQuest) * 100).toFixed(
              0
            ) + "%";
        });

        return percentageObject;
      });
    }
    return { ...document, selectedPercentage, contendedPercentage };
  } else {
    const selectedPercentage = result?.map((item) => {
      const selectedKeys = Object.keys(item?.selected);
      const totalSelected = selectedKeys.reduce(
        (sum, key) => sum + item.selected[key],
        0
      );
      const percentageObject = {};

      selectedKeys.forEach((key) => {
        percentageObject[key] =
          ((item.selected[key] / document.totalStartQuest) * 100).toFixed(0) +
          "%";
      });

      return percentageObject;
    });
    let contendedPercentage;
    if (
      document.whichTypeQuestion === "multiple choise" ||
      document.whichTypeQuestion === "open choice"
    ) {
      contendedPercentage = result?.map((item) => {
        if (!item?.contended) return;
        const contendedKeys = Object.keys(item?.contended);
        const totalSelected = contendedKeys.reduce(
          (sum, key) => sum + item.contended[key],
          0
        );
        const percentageObject = {};

        contendedKeys.forEach((key) => {
          percentageObject[key] =
            ((item.contended[key] / document.totalStartQuest) * 100).toFixed(
              0
            ) + "%";
        });

        return percentageObject;
      });
    }

    return { ...document, selectedPercentage, contendedPercentage };
  }
};
