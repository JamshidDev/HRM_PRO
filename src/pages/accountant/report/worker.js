self.onmessage = function (e) {
    const { tree, expandSet } = e.data;
    console.log('Worker received:', { tree, expandSet });
    // self.postMessage(e.data);
    function flattenTreeWithLevel(tree, level = 0) {
        const result = [];

        function traverse(nodes, currentLevel) {
            if (!nodes || !Array.isArray(nodes)) return; // Nodes array ekanligini tekshirish
            for (const node of nodes) {
                const { children, ...rest } = node;
                result.push({ ...rest, level: currentLevel, isHasChildren: !!children?.length });
                // expandSet array sifatida keladi, shuning uchun includes ishlatamiz
                if (expandSet.includes(node.id) && children?.length > 0) {
                    traverse(children, currentLevel + 1);
                }
            }
        }
        traverse(tree, level);
        console.log('Worker result:', result);
        self.postMessage(result);
    }

    flattenTreeWithLevel(tree, 0);
};