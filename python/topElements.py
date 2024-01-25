def getTopElements(listOfItems, K):
    topList = []
    for i in range(0, K):
        maxNum = 0
        for j in range(len(listOfItems)):
            if listOfItems[j] > maxNum:
                maxNum = listOfItems[j]
        listOfItems.remove(maxNum)
        topList.append(maxNum)
    return topList

listOfItems = [54, 78, 3, 38, 9, 89, 6, 12]
k = 3
topElementList = getTopElements(listOfItems, k)
print(topElementList)